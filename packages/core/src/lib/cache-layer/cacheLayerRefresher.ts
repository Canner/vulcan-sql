import ms, { StringValue } from 'ms';
import { uniq } from 'lodash';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { APISchema } from '@vulcan-sql/core/models';
import { ConfigurationError } from '../utils/errors';
import { ICacheLayerLoader } from './cacheLayerLoader';

export interface ICacheLayerRefresher {
  /**
   * Start the job to load the data source to cache storage and created tables from cache settings in schemas
   * @param schemas The API schemas from artifact to load and schedule
   * @param runImmediately If true, the refresh job will be run immediately after start
   */
  start(schemas: Array<APISchema>, runImmediately?: boolean): Promise<void>;
  /* Stop the cache layer loader schedule */
  stop(): void;
}

@injectable()
export class CacheLayerRefresher implements ICacheLayerRefresher {
  private cacheLoader: ICacheLayerLoader;
  private scheduler = new ToadScheduler();

  constructor(@inject(TYPES.CacheLayerLoader) loader: ICacheLayerLoader) {
    this.cacheLoader = loader;
  }

  public async start(
    schemas: Array<APISchema>,
    runImmediately = true
  ): Promise<void> {
    // check if the cache table name is duplicated more than one API schemas
    this.checkDuplicateCacheTableName(schemas);
    // check if the index name is duplicated more than one API schemas
    this.checkDuplicateIndex(schemas);
    // traverse each cache table of each schema
    await Promise.all(
      schemas.map(async (schema) => {
        // skip the schema by return if not set the cache
        if (!schema.cache) return;
        return await Promise.all(
          schema.cache.map(async (cache) => {
            const { cacheTableName, profile, refreshTime } = cache;
            // replace the '/' tp '_' to avoid the file path issue for templateSource
            const templateName = schema.templateSource.replace('/', '_');
            // If refresh time is set, use the scheduler to schedule the load task for refresh
            if (refreshTime?.every) {
              // use the work id for task to know which failed when execute and get the job to by id.
              const workerId = `${templateName}/${profile}/${cacheTableName}`;
              const milliseconds = ms(refreshTime.every as StringValue);
              const refreshJob = new SimpleIntervalJob(
                { milliseconds, runImmediately },
                new AsyncTask(workerId, async () => {
                  // load data the to cache storage

                  await this.cacheLoader.load(templateName, cache);
                }),
                { preventOverrun: true, id: workerId }
              );
              // add the job to schedule cache refresh task
              this.scheduler.addIntervalJob(refreshJob);
            } else {
              await this.cacheLoader.load(templateName, cache);
            }
          })
        );
      })
    );
  }

  /**
   * Stop the cache layer loader
   */
  public stop() {
    this.scheduler.stop();
  }

  private checkDuplicateCacheTableName(schemas: APISchema[]) {
    const tableNames = schemas
      // => [[table1, table2], [table1, table3], [table4]]
      .map((schema) => schema.cache?.map((cache) => cache.cacheTableName))
      // => [table1, table2, table1, table3, table4]
      .flat()
      // use filter to make sure it has value and pick it.
      .filter((tableName) => tableName);
    if (uniq(tableNames).length !== tableNames.length)
      throw new ConfigurationError(
        'Not allow to set same cache table name more than one API schema.'
      );
  }

  private checkDuplicateIndex(schemas: APISchema[]) {
    const indexNames = schemas
      // => [[table1_idx, table1_idx2, table2_idx], [table1_idx, table3_idx], [table4_idx]]
      .map((schema) =>
        schema.cache
          ?.map((cache) => (cache.indexes ? Object.keys(cache.indexes) : []))
          .flat()
      )
      // => [table1_idx, table1_idx2, table2_idx, table1_idx, table3_idx, table4_idx]
      .flat()
      // use filter to make sure it has value and pick it.
      .filter((indexName) => indexName);
    if (uniq(indexNames).length !== indexNames.length)
      throw new ConfigurationError(
        'Not allow to set same index name more than one API schema.'
      );
  }
}
