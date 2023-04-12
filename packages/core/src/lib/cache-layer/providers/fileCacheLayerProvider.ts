import * as glob from 'glob';
import * as path from 'path';
import {
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  CacheFileInfo,
  CacheLayerProvider,
  CacheLayerProviderType,
  ICacheLayerOptions,
} from '@vulcan-sql/core/models';
import { CacheLayerOptions, ConfigurationError } from '@vulcan-sql/core';

@VulcanInternalExtension()
@VulcanExtensionId(CacheLayerProviderType.LocalFile)
export class FileCacheLayerProvider extends CacheLayerProvider {
  private options: ICacheLayerOptions;

  constructor(
    @inject(TYPES.CacheLayerOptions) options: CacheLayerOptions,
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    this.options = options;
  }

  public async *getFiles(): AsyncGenerator<CacheFileInfo> {
    if (!this.options?.folderPath)
      throw new ConfigurationError(`Config dataCache.folderPath is required`);

    const files = await this.getDataCacheFilePaths();

    for (const file of files) {
      yield {
        name: path.relative(this.options.folderPath!, file),
      };
    }
  }

  private async getDataCacheFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const pattern = path
        .resolve(this.options.folderPath!, '**', `*.parquet`)
        .split(path.sep)
        .join('/');
      glob(pattern, { nodir: true }, (err, files) => {
        if (err) return reject(err);
        else return resolve(files);
      });
    });
  }
}
