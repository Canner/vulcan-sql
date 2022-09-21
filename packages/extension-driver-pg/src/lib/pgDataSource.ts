import {
  DataResult,
  DataSource,
  ExecuteOptions,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Pool, PoolConfig, QueryResult } from 'pg';
import * as Cursor from 'pg-cursor';
import { Readable } from 'stream';
import { mapFromPGTypeId } from './typeMapper';

export interface PGOptions extends PoolConfig {
  chunkSize?: number;
}

@VulcanExtensionId('pg')
export class PGDataSource extends DataSource<any, PGOptions> {
  private logger = this.getLogger();
  private poolMapping = new Map<string, { pool: Pool; options?: PGOptions }>();

  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using pg driver`
      );
      const pool = new Pool(profile.connection);
      // https://node-postgres.com/api/pool#poolconnect
      // When a client is sitting idly in the pool it can still emit errors because it is connected to a live backend.
      // If the backend goes down or a network partition is encountered all the idle, connected clients in your application will emit an error through the pool's error event emitter.
      pool.on('error', () => {
        // Ignore the pool client error
      });
      this.poolMapping.set(profile.name, {
        pool: new Pool(profile.connection),
        options: profile.connection,
      });
      // Testing connection
      await pool.query('SELECT 1;');
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
  }: ExecuteOptions): Promise<DataResult> {
    if (!this.poolMapping.has(profileName)) {
      throw new Error(`Profile instance ${profileName} not found`);
    }
    const { pool, options } = this.poolMapping.get(profileName)!;
    this.logger.debug(`Acquiring connection from ${profileName}`);
    const client = await pool.connect();
    this.logger.debug(`Acquired connection from ${profileName}`);
    try {
      const cursor = client.query(
        new Cursor(sql, Array.from(bindParams.values()))
      );
      cursor.once('done', () => {
        this.logger.debug(
          `Data fetched, release connection from ${profileName}`
        );
        client.release();
      });
      // All promises MUST fulfilled in this function or we are not able to release the connection when error occurred
      return await this.getResultFromCursor(cursor, options);
    } catch (e: any) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      client.release();
      throw e;
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  public async destroy() {
    for (const { pool } of this.poolMapping.values()) {
      await pool.end();
    }
  }

  private async getResultFromCursor(
    cursor: Cursor,
    options: PGOptions = {}
  ): Promise<DataResult> {
    const { chunkSize = 100 } = options;
    const cursorRead = this.cursorRead.bind(this);
    const firstChunk = await cursorRead(cursor, chunkSize);

    const stream = new Readable({
      objectMode: true,
      read() {
        cursorRead(cursor, chunkSize)
          .then(({ rows }) => {
            if (rows.length === 0) {
              this.push(null);
              // Send done event to notify upstream to release the connection.
              cursor.emit('done');
            }
            for (const row of rows) {
              this.push(row);
            }
          })
          .catch((error) => {
            this.emit('error', error);
            // Send done event to notify upstream to release the connection.
            cursor.emit('done');
          });
      },
    });

    // Push the first chunk data.
    for (const row of firstChunk.rows) {
      stream.push(row);
    }

    return {
      getColumns: () =>
        firstChunk.result.fields.map((field) => ({
          name: field.name,
          type: mapFromPGTypeId(field.dataTypeID),
        })),
      getData: () => stream,
    };
  }

  public async cursorRead(cursor: Cursor, maxRows: number) {
    return new Promise<{ rows: any[]; result: QueryResult }>(
      (resolve, reject) => {
        cursor.read(maxRows, (err, rows, result) => {
          if (err) {
            return reject(err);
          }
          resolve({ rows, result });
        });
      }
    );
  }
}
