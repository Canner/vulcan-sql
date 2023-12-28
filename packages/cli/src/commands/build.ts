import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as ora from 'ora';
import { modulePath } from '../utils';
import { handleStop } from './stop';

export interface BuildCommandOptions {
  config: string;
  requireFromLocal?: boolean;
  pull?: boolean;
  shouldStopVulcanEngine?: boolean;
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
  const shouldStopVulcanEngine = options.shouldStopVulcanEngine ?? true;

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanBuilder } = await import(modulePath('@vulcan-sql/build', options.requireFromLocal));

  // Build project
  const spinner = ora('Building project...\n').start();
  try {
    const builder = new VulcanBuilder(config);
    const semantics = await builder.build();
    spinner.succeed('Built successfully.');
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

export const handleBuild = async (
  options: Partial<BuildCommandOptions>
): Promise<void> => {
  await buildVulcan(mergeBuildDefaultOption(options));
};
