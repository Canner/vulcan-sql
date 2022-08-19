import * as path from 'path';

export const localModulePath = (moduleName: string): string => {
  return path.resolve(process.cwd(), 'node_modules', moduleName);
};
