import {
  DataResult,
  DataSource,
  ExecuteOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
  ExportOptions,
  ConfigurationError,
} from '@vulcan-sql/api-layer';
import { Readable } from 'stream';
import { buildSQL } from './bqlSqlBuilder';
import { mapFromBQTypeId } from './typeMapper';
import { BigQuery, Query, Job, BigQueryOptions } from '@google-cloud/bigquery';
import bigquery from '@google-cloud/bigquery/build/src/types';
import { Storage, StorageOptions } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
export interface BQCache {
  bucketName: string;
}
export interface BQOptions extends BigQueryOptions {
  chunkSize?: number;
  location?: string;
  cache?: BQCache;
}

@VulcanExtensionId('bq')
export class BQDataSource extends DataSource<any, BQOptions> {
  private logger = this.getLogger();
  private bqMapping = new Map<
    string,
    {
      bigQuery: BigQuery;
      storage: Storage;
      options?: BQOptions;
      cache?: BQCache;
    }
  >();

  public override async onActivate() {
    const profiles = this.getProfiles().values();
    for (const profile of profiles) {
      this.logger.debug(
        `Initializing profile: ${profile.name} using bq driver`
      );
      const bigqueryClient = new BigQuery(profile.connection);
      // https://cloud.google.com/nodejs/docs/reference/bigquery/latest
      const storage = new Storage(profile.connection as StorageOptions);
      this.bqMapping.set(profile.name, {
        bigQuery: bigqueryClient,
        storage: storage,
        options: profile.connection,
        cache: profile.cache as BQCache,
      });

      // Testing connection
      await bigqueryClient.query('SELECT 1;');
      this.logger.debug(`Profile ${profile.name} initialized`);
    }
  }

  public override async export({
    sql: statement,
    profileName,
    directory,
  }: ExportOptions): Promise<void> {
    // Use "EXPORT DATA" statement to store query result in the GCS bucket {specified in profile.cache.bucketName} temporarily, and will remove the stored data after download.
    // EXPORT DATA ref: https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements#export_data_statement
    this.checkProfileExist(profileName);
    if (!fs.existsSync(directory)) {
      throw new Error(`Directory "${directory}" does not exist`);
    }

    const { bigQuery, storage, options, cache } =
      this.bqMapping.get(profileName)!;
    const bucketName = cache?.bucketName;
    if (!bucketName)
      throw new ConfigurationError(
        `cache.bucketName in profile "${profileName}" is required when using cache feature.`
      );
    // Use the directory to avoid filename collision,
    // The wildcard indicates the partition,
    // ref: https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements#export_option_list
    const bucketObjPrefix = path.join(bucketName, directory);
    const uri = `gs://${path.join(bucketObjPrefix, 'part*.parquet')}`;
    const queryOptions = {
      query: `EXPORT DATA OPTIONS( uri="${uri}", format='PARQUET') AS ${statement}`,
      location: options?.location || 'US',
    };
    try {
      const [job] = await bigQuery.createQueryJob(queryOptions);
      await this.runJobAndWait(job);
      const getFilesResponse = await storage.bucket(bucketName).getFiles({
        prefix: directory[0] === '/' ? directory.slice(1) : directory, // remove the first slash if needed
      });
      await Promise.all(
        getFilesResponse[0].map(async (file) => {
          const fileName = `${file.name.split('/').pop()}`;
          await file.download({
            destination: path.resolve(process.cwd(), directory, fileName),
          });
          // delete file from GCS bucket
          await file.delete();
        })
      );
    } catch (e: any) {
      this.logger.debug(`Error when exporting parquet "${directory}"`, e);
      throw e;
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    this.checkProfileExist(profileName);
    const { bigQuery, options } = this.bqMapping.get(profileName)!;

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

      const [job] = await bigQuery.createQueryJob(queryOptions);

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
    const fetchJobResult = this.fetchJobResult.bind(this);
    const firstChunk = await fetchJobResult(queryJob, chunkSize);

    // save first chunk in buffer for incoming requests
    let bufferedRows = [...firstChunk.rows];
    let bufferReadIndex = 0;
    let nextQuery = firstChunk.nextQuery;

    const fetchNext = async () => {
      if (bufferReadIndex >= bufferedRows.length) {
        if (nextQuery == null) return null;

        const fetchData = await fetchJobResult(queryJob, chunkSize, nextQuery);
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

  public async fetchJobResult(
    queryJob: Job,
    chunkSize: number,
    nextQuery?: Query | null | undefined
  ) {
    return new Promise<{
      rows: any[];
      nextQuery: Query | null | undefined;
      apiResponse: bigquery.IGetQueryResultsResponse | null | undefined;
    }>((resolve, reject) => {
      queryJob.getQueryResults(
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

  private checkProfileExist(profileName: string): void {
    if (!this.bqMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
  }

  private async runJobAndWait(job: any): Promise<void> {
    // Wait for the job to complete
    let [jobResult] = await job.getMetadata();
    while (jobResult.status.state !== 'DONE') {
      [jobResult] = await job.getMetadata();
    }
  }
}
