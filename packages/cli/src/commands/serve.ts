import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  addShutdownJob,
  modulePath,
  logger,
  removeShutdownJob,
} from '../utils';
import { Semantic } from '@vulcan-sql/core';

export interface ServeCommandOptions {
  config: string;
  port: number;
  platform: string;
  requireFromLocal?: boolean;
  pull?: boolean;
  semantics: Semantic[];
  shouldRunVulcanEngine?: boolean;
}

const defaultOptions: ServeCommandOptions = {
  config: './vulcan.yaml',
  port: 3000,
  semantics: [],
  platform: 'linux/amd64',
};

export const mergeServeDefaultOption = (
  options: Partial<ServeCommandOptions>
) => {
  return {
    ...defaultOptions,
    ...options,
  } as ServeCommandOptions;
};

export const serveVulcan = async (options: ServeCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));
  const shouldRunVulcanEngine = options.shouldRunVulcanEngine ?? true;

  if ('semantic-model' in config && shouldRunVulcanEngine) {
    const { buildSemanticModels, runVulcanEngine } = await import(modulePath('@vulcan-sql/build', options.requireFromLocal));

    const semantics = await buildSemanticModels(config['semantic-model']);
    if (semantics.length > 0) {
      logger.warn('At the moment, we only support one semantic model.');
      const semantic = semantics[0];
      const compiledFolderPath = path.resolve(process.cwd(), config['semantic-model']['folderPath'] ?? '.');
      const compiledFilePath = path.resolve(compiledFolderPath, config['semantic-model']['filePaths'][0].output);

      await runVulcanEngine(semantic, compiledFilePath, options.platform, options.pull);
    }
  }

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanServer } = await import(modulePath('@vulcan-sql/serve', options.requireFromLocal));

  // Start server
  logger.info(`Starting server...`);
  const server = new VulcanServer(config);
  await server.start();
  logger.info(`Server is listening at port ${config.port || 3000}.`);

  const closeServerJob = async () => {
    logger.info(`Stopping server...`);
    await server.close();
    logger.info(`Server stopped`);
  };
  addShutdownJob(closeServerJob);

  return {
    stopServer: async () => {
      removeShutdownJob(closeServerJob);
      await closeServerJob();
    },
  };
};

export const handleServe = async (
  options: Partial<ServeCommandOptions>
): Promise<void> => {
  await serveVulcan(mergeServeDefaultOption(options));
};
