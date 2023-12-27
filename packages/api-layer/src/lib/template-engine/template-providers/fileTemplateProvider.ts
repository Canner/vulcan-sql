import {
  Template,
  TemplateProvider,
} from '../../../models/extensions/templateProvider';
import * as glob from 'glob';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { TemplateEngineOptions } from '@vulcan-sql/api-layer/options';
import { ConfigurationError } from '../../utils/errors';

@VulcanInternalExtension()
@VulcanExtensionId(TemplateProviderType.LocalFile)
export class FileTemplateProvider extends TemplateProvider {
  private options: ITemplateEngineOptions;

  constructor(
    @inject(TYPES.TemplateEngineOptions) options: TemplateEngineOptions,
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    this.options = options;
  }

  public async *getTemplates(): AsyncGenerator<Template> {
    if (!this.options?.folderPath)
      throw new ConfigurationError(`Config template.folderPath is required`);

    const files = await this.getTemplateFilePaths();

    for (const file of files) {
      yield {
        name: path
          .relative(this.options.folderPath!, file)
          .replace(/\.sql$/, ''),
        statement: await fs.readFile(file, 'utf8'),
      };
    }
  }

  private async getTemplateFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(
        path
          .resolve(this.options.folderPath!, '**', '*.sql')
          .split(path.sep)
          .join('/'),
        { nodir: true },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
