import {
  DataResult,
  DataSource,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/api-layer';
import { Pool, PoolConfig, QueryResult } from 'pg';
import * as Cursor from 'pg-cursor';
import { Readable } from 'stream';
import { buildSQL } from './sqlBuilder';
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
      pool.on('error', (err) => {
        this.logger.warn(
          `Pool client of profile instance ${profile.name} connecting failed, detail error, ${err}`
        );
      });
      this.poolMapping.set(profile.name, {
        pool,
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
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    if (!this.poolMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { pool, options } = this.poolMapping.get(profileName)!;
    this.logger.debug(`Acquiring connection from ${profileName}`);
    const client = await pool.connect();
    this.logger.debug(`Acquired connection from ${profileName}`);
    try {
      const builtSQL = buildSQL(sql, operations);
      const cursor = client.query(
        new Cursor(builtSQL, Array.from(bindParams.values()))
      );
      cursor.once('done', async () => {
        this.logger.debug(
          `Data fetched, release connection from ${profileName}`
        );
        // It is important to close the cursor before releasing connection, or the connection might not able to handle next request.
        await cursor.close();
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
    // save first chunk in buffer for incoming requests
    let bufferedRows = [...firstChunk.rows];
    let bufferReadIndex = 0;
    const fetchNext = async () => {
      if (bufferReadIndex >= bufferedRows.length) {
        bufferedRows = (await cursorRead(cursor, chunkSize)).rows;
        bufferReadIndex = 0;
      }
      return bufferedRows[bufferReadIndex++] || null;
    };
    const stream = new Readable({
      objectMode: true,
      read() {
        fetchNext()
          .then((row) => {
            this.push(row);
          })
          .catch((error) => {
            this.destroy(error);
          });
      },
      destroy(error: Error | null, cb: (error: Error | null) => void) {
        // Send done event to notify upstream to release the connection.
        cursor.emit('done');
        cb(error);
      },
      // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
      autoDestroy: true,
    });
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
