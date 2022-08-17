import {
  SchemaFormat,
  SchemaData,
  SchemaReader,
  SchemaReaderType,
} from '@vulcan-sql/build/models';
import * as glob from 'glob';
import { promises as fs } from 'fs';
import * as path from 'path';
import { SchemaParserOptions } from '@vulcan-sql/build/options';
import {
  VulcanExtensionId,
  VulcanInternalExtension,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/build/containers';

export interface FileSchemaReaderOptions {
  folderPath: string;
}

@VulcanInternalExtension()
@VulcanExtensionId(SchemaReaderType.LocalFile)
export class FileSchemaReader extends SchemaReader {
  private options: SchemaParserOptions;

  constructor(
    @inject(TYPES.SchemaParserOptions) options: SchemaParserOptions,
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    this.options = options;
  }

  public async *readSchema(): AsyncGenerator<SchemaData> {
    if (!this.options?.folderPath)
      throw new Error(`Config schema-parser.folderPath must be defined`);
    const files = await this.getSchemaFilePaths();

    for (const file of files) {
      const fileName = path.relative(this.options!.folderPath, file);
      const { ext } = path.parse(fileName);
      const sourceName = fileName.replace(new RegExp(`\\${ext}$`), '');
      yield {
        sourceName,
        content: await fs.readFile(file, 'utf8'),
        type: SchemaFormat.YAML,
      };
    }
  }

  private async getSchemaFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(
        path.resolve(this.options!.folderPath, '**', '*.yaml'),
        { nodir: true },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
