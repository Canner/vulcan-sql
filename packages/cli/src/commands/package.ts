import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as ora from 'ora';
import { modulePath } from '../utils';
import { handleStop } from './stop';

export interface PackageCommandOptions {
  config: string;
  output: string;
  target: string;
  requireFromLocal?: boolean;
  shouldStopVulcanEngine?: boolean;
  pull?: boolean;
  platform: string;
}

const defaultOptions: PackageCommandOptions = {
  config: './vulcan.yaml',
  output: 'node',
  target: 'vulcan-server',
  platform: 'linux/amd64',
};

export const packageVulcan = async (options: PackageCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));
  const shouldStopVulcanEngine = options.shouldStopVulcanEngine ?? true;

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanBuilder } = await import(modulePath('@vulcan-sql/build', options.requireFromLocal));

  // Build project
  const spinner = ora('Packaging project...\n').start();
  try {
    const builder = new VulcanBuilder(config);
    const semantics = await builder.build(options.platform, options, options.pull);
    spinner.succeed('Package successfully.');
    if (semantics.length > 0 && shouldStopVulcanEngine) {
      handleStop();
    }
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
