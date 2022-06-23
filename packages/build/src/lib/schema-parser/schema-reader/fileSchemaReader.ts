import { SchemaFormat, SchemaData, SchemaReader } from './schemaReader';
import * as glob from 'glob';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface FileSchemaReaderOptions {
  folderPath: string;
}

export class FileSchemaReader extends SchemaReader {
  private options: FileSchemaReaderOptions;

  constructor(options: FileSchemaReaderOptions) {
    super();
    this.options = options;
  }

  public async *readSchema(): AsyncGenerator<SchemaData> {
    const files = await this.getSchemaFilePaths();

    for (const file of files) {
      const fileName = path.relative(this.options.folderPath, file);
      const { ext } = path.parse(fileName);
      const name = fileName.replace(new RegExp(`\\${ext}$`), '');
      yield {
        name,
        content: await fs.readFile(file, 'utf8'),
        type: SchemaFormat.YAML,
      };
    }
  }

  private async getSchemaFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(
        path.resolve(this.options.folderPath, '**', '*.yaml'),
        { nodir: true },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
