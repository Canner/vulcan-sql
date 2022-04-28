import { Template, TemplateProvider } from './templateProvider';
import * as glob from 'glob';
import * as fs from 'fs/promises';
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
        name: path.relative(this.options.folderPath, file),
        statement: await fs.readFile(file, 'utf8'),
      };
    }
  }

  private async getTemplateFilePaths(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(
        './**/*.sql',
        { nodir: true, root: this.options.folderPath },
        (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        }
      );
    });
  }
}
