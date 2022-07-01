// Import built in extensions to ensure TypeScript compiler includes them.
import '../built-in-extensions';
import * as fs from 'fs/promises';
import * as path from 'path';
import { flatten } from 'lodash';
import { interfaces } from 'inversify';
import { TYPES } from '@vulcan/core/containers';

export const importExtensions = async (folder: string) => {
  const extensions = await import(folder);
  return extensions.default || [];
};

export const bindExtensions = async (bind: interfaces.Bind) => {
  const builtInExtensionNames = (
    await fs.readdir(path.join(__dirname, '..', 'built-in-extensions'))
  ).filter((name) => name !== 'index.ts');

  const extensions = flatten(
    await Promise.all(
      builtInExtensionNames.map((name) =>
        importExtensions(
          path.join(__dirname, '..', 'built-in-extensions', name)
        )
      )
    )
  );
  extensions.forEach((extension) => {
    bind(TYPES.CompilerExtension).to(extension).inSingletonScope();
  });
};
