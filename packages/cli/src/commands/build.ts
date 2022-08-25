import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as ora from 'ora';
import { localModulePath } from '../utils';

export interface BuildCommandOptions {
  config: string;
}

const defaultOptions: BuildCommandOptions = {
  config: './vulcan.yaml',
};

export const mergeBuildDefaultOption = (
  options: Partial<BuildCommandOptions>
) => {
  return {
    ...defaultOptions,
    ...options,
  } as BuildCommandOptions;
};

export const buildVulcan = async (options: BuildCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanBuilder } = await import(localModulePath('@vulcan-sql/build'));

  // Build project
  const spinner = ora('Building project...').start();
  try {
    const builder = new VulcanBuilder(config);
    await builder.build();
    spinner.succeed('Built successfully.');
  } catch (e) {
    spinner.fail();
    throw e;
  } finally {
    spinner.stop();
  }
};

export const handleBuild = async (
  options: Partial<BuildCommandOptions>
): Promise<void> => {
  await buildVulcan(mergeBuildDefaultOption(options));
};
