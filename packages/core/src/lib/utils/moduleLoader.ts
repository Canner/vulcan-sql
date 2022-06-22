import * as glob from 'glob';

// The type for class T
export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export class ModuleLoader {
  /**
   * dynamic import default module.
   * @param folderOrFile The folder / file path
   * @returns default module
   */
  protected async import<T = any>(folderOrFile: string) {
    const module = await import(folderOrFile);
    return module.default as T;
  }

  protected async getFiles(folder: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(folder, { nodir: true }, (err, files) => {
        if (err) return reject(err);
        else return resolve(files);
      });
    });
  }
}
