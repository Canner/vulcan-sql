// The type for class T
export interface ClassType<T> extends Function {
  new (...args: any[]): T;
}

/**
 * dynamic import default module.
 * @param folderOrFile The folder / file path
 * @returns default module
 */
export const defaultImport = async <T = any>(folderOrFile: string) => {
  const module = await import(folderOrFile);
  return module.default as T;
};
