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

const localModuleVersion = async (moduleName: string): Promise<string> => {
  try {
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

export const handleVersion = async (): Promise<void> => {
  logger.info(`cli version: ${await cliVersion()}`);
  for (const pkg of ['core', 'build', 'serve']) {
    logger.info(
      `${pkg} version: ${await localModuleVersion(`@vulcan-sql/${pkg}`)}`
    );
  }
};
