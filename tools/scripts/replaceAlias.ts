import * as glob from 'glob';
import * as path from 'path';
import { promises as fs } from 'fs';

const requireRegex = (packageName: string) =>
  new RegExp(`require\\(['"](@vulcan-sql\/${packageName}[^'"]*)['"]\\)`, 'g');
const importRegex = (packageName: string) =>
  new RegExp(
    `(import|from) ['"](@vulcan-sql\\/${packageName}\\/[^'"]*)['"]`,
    'g'
  );

async function getFiles(packageName: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(
      path.resolve(
        __dirname,
        '..',
        '..',
        'dist',
        'packages',
        packageName,
        '**',
        '*.+(ts|js)'
      ),
      { nodir: true },
      (err, files) => {
        if (err) return reject(err);
        else return resolve(files);
      }
    );
  });
}

function getRelativePathFromRoot(
  filePath: string,
  importPath: string,
  packageName: string
) {
  return path.relative(
    path.dirname(filePath),
    path.resolve(
      __dirname,
      '..',
      '..',
      'dist',
      'packages',
      packageName,
      importPath
    )
  );
}

async function replaceFile(
  filePath: string,
  {
    packageName,
    aliasMappings,
  }: {
    packageName: string;
    aliasMappings: { regex: RegExp; replacePath: string }[];
  }
) {
  let content = await fs.readFile(filePath, 'utf8');

  const getReplacePath = (importPath: string) => {
    const aliasMapping = aliasMappings.find((mapping) =>
      mapping.regex.test(importPath)
    );
    if (aliasMapping) {
      return importPath.replace(
        aliasMapping.regex,
        getRelativePathFromRoot(filePath, aliasMapping.replacePath, packageName)
      );
    }
    return importPath;
  };

  const replacePath = (matched: string, subMatched: string) => {
    const index = matched.indexOf(subMatched);
    return (
      matched.substring(0, index) +
      getReplacePath(subMatched) +
      matched.substring(index + subMatched.length)
    );
  };

  content = content.replace(requireRegex(packageName), replacePath);
  content = content.replace(importRegex(packageName), (matched, _, p2) =>
    replacePath(matched, p2)
  );
  await fs.writeFile(filePath, content, 'utf8');
}

async function replacePackage(packageName: string) {
  // Read ts config
  const tsConfig = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '..', '..', 'tsconfig.base.json'),
      'utf8'
    )
  );
  const alias = tsConfig.compilerOptions.paths;
  const aliasMappings = Object.keys(alias)
    .filter((aliasKey) => aliasKey.startsWith(`@vulcan-sql/${packageName}`))
    .map((aliasKey) => {
      // There are two kinds of key @vulcan-sql/package/path and @vulcan-sql/package/path/*
      const regex = aliasKey.endsWith('/*')
        ? new RegExp(`${aliasKey.substring(0, aliasKey.length - 2)}`)
        : new RegExp(`${aliasKey}$`);
      // There are two kinds of path @vulcan-sql/package/path and @vulcan-sql/package/path/*
      const absPath = path.resolve(
        ...alias[aliasKey].map((path) =>
          path.endsWith('/*') ? path.substring(0, path.length - 2) : path
        )
      );
      // Get the relative path from package root
      const replacePath = path.relative(
        path.resolve(__dirname, '..', '..', 'packages', packageName),
        absPath
      );
      return {
        regex,
        replacePath: replacePath,
      };
    });
  const files = await getFiles(packageName);
  for (const file of files) {
    await replaceFile(file, { packageName, aliasMappings });
  }
}

replacePackage(process.argv[2])
  .then(() => console.log('done'))
  .catch(console.error);
