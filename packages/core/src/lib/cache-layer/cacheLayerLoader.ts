import * as path from 'path';
import * as fs from 'fs';
import { uniq } from 'lodash';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  ICacheLayerOptions,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core/models';
import { CacheLayerOptions } from '@vulcan-sql/core/options';
import { APISchema, DataSource } from '@vulcan-sql/core/models';
import { ConfigurationError } from '../utils/errors';

export interface ICacheLayerLoader {
  preload(schemas: Array<APISchema>, cacheProfile: string): Promise<void>;
}

@injectable()
export class CacheLayerLoader implements ICacheLayerLoader {
  // Use protected method for unit test
  protected dataSourceFactory: interfaces.SimpleFactory<DataSource>;
  private options: ICacheLayerOptions;

  constructor(
    @inject(TYPES.CacheLayerOptions) options: CacheLayerOptions,
    @inject(TYPES.Factory_DataSource)
    dataSourceFactory: interfaces.SimpleFactory<DataSource>
  ) {
    this.dataSourceFactory = dataSourceFactory;
    this.options = options;
  }

  /**
   * Preload the cache files to cache data source and created tables
   * @param schemas The API schemas from artifact to preload
   */
  public async preload(schemas: Array<APISchema>): Promise<void> {
    // prepare cache data source
    const cacheStorage = this.dataSourceFactory(cacheProfileName);
    // check if the cache table name is duplicated more than one API schemas
    this.checkDuplicateCacheTableName(schemas);
    // traverse each cache table of each schema
    for (const schema of schemas) {
      // skip the schema if not set the cache
      if (!schema.cache) continue;
      for (const cache of schema.cache) {
        const { cacheTableName, sql, profile } = cache;
        const dataSource = this.dataSourceFactory(profile);
        // directory pattern:[folderPath]/[schema.templateSource]/[profileName]/[cacheTableName]
        const directory = this.generateDirectory(
          schema.templateSource,
          profile,
          cacheTableName
        );
        if (!fs.existsSync(directory!))
          fs.mkdirSync(directory!, { recursive: true });

        // 1. export to cache files according to each schema set the cache value
        await dataSource.export({
          sql,
          directory,
          profileName: profile,
          type: this.options.type!,
        });
        // 2. preload the files to cache data source
        await cacheStorage.import({
          tableName: cacheTableName,
          directory,
          // use the "vulcan.cache" profile to import the cache data
          profileName: cacheProfileName,
          // default schema name for cache layer
          schema: vulcanCacheSchemaName,
          type: this.options.type!,
        });
      }
    }
  }

  private checkDuplicateCacheTableName(schemas: APISchema[]) {
    const tableNames = schemas
      // => [[table1, table2], [table1, table3], [undefined, table4], undefined]
      .map((schema) => schema.cache?.map((cache) => cache.cacheTableName))
      // => [table1, table2, table1, table3, undefined, table4, undefined]
      .flat()
      // [table1, table2, table1, table3, table4]
      .filter((tableName) => tableName);
    if (uniq(tableNames).length !== tableNames.length)
      throw new ConfigurationError(
        'Not allow to set same cache table name more than one API schema.'
      );
  }

  /**
   * Generate the file path for cache file path to export.
   * Directory pattern: [folderPath]/[templateSource]/[profileName]/[cacheTableName]
   * @param templateSource The template source name
   * @param profileName The profile name
   * @param cacheTableName The cache table name
   */
  private generateDirectory(
    templateSource: string,
    profileName: string,
    cacheTableName: string
  ) {
    // replace the '/' tp '_' to avoid the file path issue for templateSource
    const templateName = templateSource.replace('/', '_');
    const directory = path.resolve(
      this.options.folderPath!,
      templateName,
      profileName,
      cacheTableName
    );
    return directory;
  }
}
