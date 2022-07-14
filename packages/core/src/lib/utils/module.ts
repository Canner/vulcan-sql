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

export interface ModuleProperties {
  [property: string]: any[];
}
/**
 * merged multiple properties of each modules to the one module object
 * @param modules: multiple module objects which include properties e.g: [{ module1Property1: [] }, { module2Property1: [] }]
 * @returns the merged properties in one module object
 */
export const mergedModules = async <T extends ModuleProperties>(
  modules: Array<T>
) => {
  const module = modules.reduce(
    (merged: ModuleProperties, current: ModuleProperties, _) => {
      for (const extension of Object.keys(current)) {
        // if current extension property has been existed in merged module, concat it.
        if (extension in merged)
          merged[extension] = [...merged[extension], ...current[extension]];
        // if extension not in merged module, add new extension property
        else merged[extension] = current[extension];
      }
      return merged;
    },
    {} as T
  );
  return module;
};
