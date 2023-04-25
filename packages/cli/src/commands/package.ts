import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as ora from 'ora';
import { localModulePath } from '../utils';

export interface PackageCommandOptions {
  config: string;
  output: string;
  target: string;
}

const defaultOptions: PackageCommandOptions = {
  config: './vulcan.yaml',
  output: 'node',
  target: 'vulcan-server',
};

export const packageVulcan = async (options: PackageCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanBuilder } = await import(localModulePath('@vulcan-sql/build'));

  // Build project
  const spinner = ora('Packaging project...').start();
  try {
    const builder = new VulcanBuilder(config);
    await builder.build(options);
    spinner.succeed('Package successfully.');
  } catch (e) {
    spinner.fail();
    throw e;
  } finally {
    spinner.stop();
  }
};

export const handlePackage = async (
  options: Partial<PackageCommandOptions>
): Promise<void> => {
  options = {
    ...defaultOptions,
    ...options,
  };
  await packageVulcan(options as PackageCommandOptions);
};
