import { Template, TemplateProvider } from './templateProvider';
import * as glob from 'glob';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface FileTemplateProviderOptions {
  folderPath: string;
}

export class FileTemplateProvider implements TemplateProvider {
  private options: FileTemplateProviderOptions;

  constructor(options: FileTemplateProviderOptions) {
    this.options = options;
  }

  public async *getTemplates(): AsyncGenerator<Template> {
    const files = await this.getTemplateFilePaths();

    for (const file of files) {
      yield {
        name: path
          .relative(this.options.folderPath, file)
          .replace(/\.sql$/, ''),
        statement: await fs.readFile(file, 'utf8'),
      };
    }
  }

  private async getTemplateFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(
        path.resolve(this.options.folderPath, '**', '*.sql'),
        { nodir: true },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
