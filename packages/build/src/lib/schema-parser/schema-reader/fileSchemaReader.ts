import { SchemaFormat, SchemaData, SchemaReader } from './schemaReader';
import * as glob from 'glob';
import { promises as fs } from 'fs';
import * as path from 'path';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan/build/containers';
import { SchemaParserOptions } from '@vulcan/build/options';

export interface FileSchemaReaderOptions {
  folderPath: string;
}

@injectable()
export class FileSchemaReader implements SchemaReader {
  private options: SchemaParserOptions;

  constructor(@inject(TYPES.SchemaParserOptions) options: SchemaParserOptions) {
    this.options = options;
  }

  public async *readSchema(): AsyncGenerator<SchemaData> {
    const files = await this.getSchemaFilePaths();

    for (const file of files) {
      const fileName = path.relative(this.options.schemaPath, file);
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
        path.resolve(this.options.schemaPath, '**', '*.yaml'),
        { nodir: true },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
