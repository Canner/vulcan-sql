import * as path from 'path';

export const modulePath = (moduleName: string, local = true): string => {
  return local ? path.resolve(process.cwd(), 'node_modules', moduleName) : moduleName;
};
