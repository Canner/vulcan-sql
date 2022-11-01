import {
  DataResult,
  DataSource,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Readable } from 'stream';
import { buildSQL } from './bqlSqlBuilder';
import { mapFromBQTypeId } from './typeMapper';
import { BigQuery, Query, Job, BigQueryOptions } from '@google-cloud/bigquery';
import bigquery from '@google-cloud/bigquery/build/src/types';

export interface BQOptions extends BigQueryOptions {
  chunkSize?: number;
  location?: string;
}

@VulcanExtensionId('bq')
export class BQDataSource extends DataSource<any, BQOptions> {
  private logger = this.getLogger();
  private bqMapping = new Map<string, { bq: BigQuery; options?: BQOptions }>();

  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using pg driver`
      );
      const bigqueryClient = new BigQuery(profile.connection);
      // https://cloud.google.com/nodejs/docs/reference/bigquery/latest

      this.bqMapping.set(profile.name, {
        bq: bigqueryClient,
      });

      // Testing connection
      await bigqueryClient.query('SELECT 1;');
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    if (!this.bqMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { bq: client, options } = this.bqMapping.get(profileName)!;
    this.logger.debug(`Acquiring connection from ${profileName}`);

    origin;
    const params: Record<string, any> = {};
    bindParams.forEach((value, key) => {
      params[key.replace('@', '')] = value;
    });

    try {
      const builtSQL = buildSQL(sql, operations);
      const queryOptions = {
        query: builtSQL,
        location: options?.location || 'US',
        params,
        maxResults: options?.chunkSize || 100,
      };

      const [job] = await client.createQueryJob(queryOptions);

      // All promises MUST fulfilled in this function or we are not able to release the connection when error occurred
      return await this.getResultFromQueryJob(job, options);
    } catch (e: any) {
      this.logger.debug(
        `Errors occurred, release connection from ${profileName}`
      );
      throw e;
    }
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `@p${parameterIndex}`;
  }

  private async getResultFromQueryJob(
    queryJob: Job,
    options?: BQOptions
  ): Promise<DataResult> {
    const { chunkSize = 100 } = options || {};
    const jobDataRead = this.jobDataRead.bind(this);
    const firstChunk = await jobDataRead(queryJob, chunkSize);

    // save first chunk in buffer for incoming requests
    let bufferedRows = [...firstChunk.rows];
    let bufferReadIndex = 0;
    let nextQuery = firstChunk.nextQuery;

    const fetchNext = async () => {
      if (bufferReadIndex >= bufferedRows.length) {
        if (nextQuery == null) return null;

        const fetchData = await jobDataRead(queryJob, chunkSize, nextQuery);
        bufferedRows = fetchData.rows;
        nextQuery = fetchData.nextQuery;
        bufferReadIndex = 0;
      }
      const res = bufferedRows[bufferReadIndex] || null;
      bufferReadIndex += 1;
      return res;
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
        cb(error);
      },
      // automatically destroy() the stream when it emits 'finish' or errors. Node > 10.16
      autoDestroy: true,
    });
    return {
      getColumns: () => {
        const fields = firstChunk.apiResponse?.schema?.fields || [];
        return fields.map((field) => ({
          name: field.name || '',
          type: mapFromBQTypeId(field.type || ''),
        }));
      },
      getData: () => stream,
    };
  }

  public async jobDataRead(
    queryJob: Job,
    chunkSize: number,
    nextQuery?: Query | null | undefined
  ) {
    return new Promise<{
      rows: any[];
      nextQuery: Query | null | undefined;
      apiResponse: bigquery.IGetQueryResultsResponse | null | undefined;
    }>((resolve, reject) => {
      return queryJob.getQueryResults(
        nextQuery || { maxResults: chunkSize },
        (err, rows, nextQuery, apiResponse) => {
          if (err) {
            return reject(err);
          }
          resolve({ rows: rows || [], nextQuery, apiResponse });
        }
      );
    });
  }
}
