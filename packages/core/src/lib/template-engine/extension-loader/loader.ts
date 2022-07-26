import { promises as fs } from 'fs';
import * as path from 'path';
import { flatten } from 'lodash';
import { interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/core/containers';

export const importExtensions = async (folder: string) => {
  const extensions = await import(folder);
  return extensions.default || [];
};

export const bindExtensions = async (
  bind: interfaces.Bind,
  externalExtensionNames: string[]
) => {
  const builtInExtensionNames = (
    await fs.readdir(path.join(__dirname, '..', 'built-in-extensions'))
  ).filter((name) => name !== 'index.ts');

  const builtInExtensions = flatten(
    await Promise.all(
      builtInExtensionNames.map((name) =>
        importExtensions(
          path.join(__dirname, '..', 'built-in-extensions', name)
        )
      )
    )
  );

  const externalExtensions = flatten(
    await Promise.all(
      externalExtensionNames.map((name) => importExtensions(name))
    )
  );

  [...builtInExtensions, ...externalExtensions].forEach((extension) => {
    bind(TYPES.CompilerExtension).to(extension).inSingletonScope();
  });
};
