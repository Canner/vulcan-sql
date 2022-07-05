// The type for class T
export interface ClassType<T> extends Function {
  new (...args: any[]): T;
}

/**
 * dynamic import default module.
 * @param foldersOrFiles The folders / files
 * @returns default module
 */
export const defaultImport = async <T = any>(
  ...foldersOrFiles: Array<string>
) => {
  const modules = [] as Array<T>;
  for (const folderOrFile of foldersOrFiles) {
    const module = await import(folderOrFile);
    // if module default is undefined, then set the all export context to default
    const imported = module.default ? (module.default as T) : (module as T);
    modules.push(imported);
  }
  return modules;
};

/**
 * merged multiple properties of each modules to the one module object
 * @param modules: multiple module objects which include properties e.g: [{ module1Property1: [] }, { module2Property1: [] }]
 * @returns the merged properties in one module object
 */
export const mergedModules = async <T = any>(modules: Array<T>) => {
  const module = modules.reduce((merged, current, _) => {
    // if current extension property has been existed in merged module
    Object.keys(current).map((extension) => {
      if (extension in merged) {
        throw new Error(
          `The extension ${extension} has defined in previous module.`
        );
      }
    });
    // merging the merged module and current module
    return { ...merged, ...current };
  }, {} as T);
  return module;
};
