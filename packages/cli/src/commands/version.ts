import * as path from 'path';
import { promises as fs } from 'fs';
import { logger } from '../utils';

const cliVersion = async () => {
  return JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '..', '..', 'package.json'),
      'utf8'
    )
  ).version;
};

const moduleVersion = async (moduleName: string, local: boolean): Promise<string> => {
  try {
    if (!local) {
      // directly require the package.json file if we don't want to require from local node_modules
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(`${moduleName}/package.json`).version;
    }

    const packageJson = path.resolve(
      process.cwd(),
      'node_modules',
      moduleName,
      'package.json'
    );
    return JSON.parse(await fs.readFile(packageJson, 'utf8')).version;
  } catch {
    return '-';
  }
};

export const handleVersion = async (requireFromLocal = true): Promise<void> => {
  logger.info(`cli version: ${await cliVersion()}`);
  for (const pkg of ['core', 'build', 'serve']) {
    logger.info(
      `${pkg} version: ${await moduleVersion(`@vulcan-sql/${pkg}`, requireFromLocal)}`
    );
  }
};
