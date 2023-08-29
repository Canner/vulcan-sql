import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  CacheLayerInfo,
  ICacheLayerOptions,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core/models';
import { CacheLayerOptions } from '@vulcan-sql/core/options';
import { DataSource } from '@vulcan-sql/core/models';
import { getLogger } from '../../lib/utils';
export interface ICacheLayerLoader {
  load(templateName: string, cache: CacheLayerInfo): Promise<void>;
}

@injectable()
export class CacheLayerLoader implements ICacheLayerLoader {
  private dataSourceFactory: interfaces.SimpleFactory<DataSource>;
  private options: ICacheLayerOptions;
  private cacheStorage: DataSource;
  private logger = getLogger({ scopeName: 'CORE' });

  constructor(
    @inject(TYPES.CacheLayerOptions) options: CacheLayerOptions,
    @inject(TYPES.Factory_DataSource)
    dataSourceFactory: interfaces.SimpleFactory<DataSource>
  ) {
    this.dataSourceFactory = dataSourceFactory;
    this.options = options;
    // prepare cache data source
    this.cacheStorage = this.dataSourceFactory(cacheProfileName);
  }

  /**
   * Load the data to the cache storage according to cache settings
   * @param templateName template source name
   * @param cache the cache layer info settings from API schema
   */
  public async load(
    templateName: string,
    cache: CacheLayerInfo
  ): Promise<void> {
    const { cacheTableName, sql, profile, indexes, folderSubpath } = cache;
    const type = this.options.type!;
    const dataSource = this.dataSourceFactory(profile);

    // generate directory for cache file path to export
    // format => [folderPath]/[schema.templateSource]/[profileName]/[cacheTableName]]/[timestamp]
    const subpath = folderSubpath || moment.utc().format('YYYYMMDDHHmmss');
    const directory = path.resolve(
      this.options.folderPath!,
      templateName,
      profile,
      cacheTableName,
      subpath
    );
    const parquetFiles = this.getParquetFiles(directory);
    if (!parquetFiles.length) {
      if (!fs.existsSync(directory!)) {
        fs.mkdirSync(directory!, { recursive: true });
      }
      // remove the files in other subfolder before export, cause we will not reuse cache files
      const folderPath = path.resolve(
        this.options.folderPath!,
        templateName,
        profile,
        cacheTableName
      );
      const folders = fs
        .readdirSync(folderPath)
        .filter((file) =>
          fs.statSync(path.resolve(folderPath, file)).isDirectory()
        );
      this.removeParquetFiles(folders, folderPath);
      // 1. export to cache files according to each schema set the cache value
      this.logger.debug(`Start to export to ${type} file in "${directory}"`);
      await dataSource.export({
        sql,
        directory,
        profileName: profile,
        type,
      });
    } else {
      this.logger.debug(
        `Parquet file \n ${parquetFiles.join(
          '\n  '
        )} found in ${directory}, skip export`
      );
    }
    this.logger.debug(`Start to load ${cacheTableName} in "${directory}"`);
    // 2. load the files to cache data source
    await this.cacheStorage.import({
      tableName: cacheTableName,
      directory,
      // use the "vulcan.cache" profile to import the cache data
      profileName: cacheProfileName,
      // default schema name for cache layer
      schema: vulcanCacheSchemaName,
      type,
      indexes,
    });
  }

  private getParquetFiles(directory: string): string[] {
    if (!directory || !fs.existsSync(directory)) return [];
    const files = fs.readdirSync(directory);
    const parquetFiles = files.filter((file) => /\.parquet$/.test(file));
    return parquetFiles;
  }

  private removeParquetFiles(folders: string[], folderPath: string) {
    folders.forEach((folder) => {
      const directory = path.resolve(folderPath, folder);
      const parquetFiles = this.getParquetFiles(directory);
      parquetFiles.forEach((file) => {
        fs.unlinkSync(path.resolve(directory, file));
      });
    });
  }
}
