import {
  DataResult,
  DataSource,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import * as snowflake from 'snowflake-sdk';
import { Options as PoolOptions, Pool } from 'generic-pool';
import { buildSQL } from './sqlBuilder';
import { mapFromSnowflakeColumnType } from './typeMapper';

export interface SnowflakeOptions
  extends snowflake.ConnectionOptions,
    PoolOptions {}

@VulcanExtensionId('snowflake')
export class SnowflakeDataSource extends DataSource<any, SnowflakeOptions> {
  private logger = this.getLogger();
  private poolMapping = new Map<
    string,
    { pool: Pool<snowflake.Connection>; options?: SnowflakeOptions }
  >();

  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using snowflake driver`
      );
      const pool = snowflake.createPool(
        profile.connection!, // optionals for Snowflake SDK
        profile.connection // optionals for connection pool
      );

      this.poolMapping.set(profile.name, {
        pool,
        options: profile.connection,
      });

      await pool.use((connection) =>
        this.getResultFromSQL(connection, 'SELECT 1;')
      );
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    if (!this.poolMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { pool } = this.poolMapping.get(profileName)!;
    this.logger.debug(`Acquiring connection from ${profileName}`);
    const client = await pool.acquire();
    this.logger.debug(`Acquired connection from ${profileName}`);
    try {
      const builtSQL = buildSQL(sql, operations);
      const statement = await this.getStatementFromSQL(
        client,
        builtSQL,
        Array.from(bindParams.values())
      );
      return {
        getColumns: () =>
          statement.getColumns().map((column) => ({
            name: column.getName(),
            type: mapFromSnowflakeColumnType(column),
          })),
        // The chunk size of stream is decided by Snowflake server, it used exponential chunk size, that is, the chunk size will be 0.1Mb, 0.2Mb, 0.4Mb ... 16Mb.
        // It sometimes occupies too mush memory with large results.
        // See https://github.com/snowflakedb/snowflake-connector-nodejs/issues/43
        getData: () => statement.streamRows(),
      };
    } finally {
      this.logger.debug(`Release connection to ${profileName}`);
      // We release the client right after the query is done without waiting the data to be fetched.
      // Because Snowflake server executes queries asynchronously, it saves the query result to storage providers like s3, so we don't need a database connection while fetching results.
      pool.release(client);
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `:${parameterIndex}`;
  }

  public async destroy() {
    for (const { pool } of this.poolMapping.values()) {
      await pool.drain();
      await pool.clear();
    }
  }

  private async getStatementFromSQL(
    connection: snowflake.Connection,
    sql: string,
    binding: any[]
  ): Promise<snowflake.Statement> {
    return new Promise<snowflake.Statement>((resolve, reject) => {
      connection.execute({
        sqlText: sql,
        streamResult: true,
        binds: binding,
        complete: (err, stmt) => {
          if (err) return reject(err);
          resolve(stmt);
        },
      });
    });
  }

  private async getResultFromSQL(
    connection: snowflake.Connection,
    sql: string
  ): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      connection.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        },
      });
    });
  }
}
