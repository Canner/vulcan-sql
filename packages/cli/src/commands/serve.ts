import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import { addShutdownJob, localModulePath, logger } from '../utils';

export interface ServeCommandOptions {
  config: string;
  port: number;
}

const defaultOptions: ServeCommandOptions = {
  config: './vulcan.yaml',
  port: 3000,
};

export const serveVulcan = async (options: ServeCommandOptions) => {
  const configPath = path.resolve(process.cwd(), options.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

  // Import dependencies. We use dynamic import here to import dependencies at runtime.
  const { VulcanServer } = await import(localModulePath('@vulcan-sql/serve'));

  // Start server
  logger.info(`Starting server...`);
  const server = new VulcanServer(config);
  await server.start();
  logger.info(`Server is listening at port ${config.port || 3000}.`);
  addShutdownJob(async () => {
    logger.info(`Stopping server...`);
    await server.close();
    logger.info(`Server stopped`);
  });
};

export const handleServe = async (
  options: Partial<ServeCommandOptions>
): Promise<void> => {
  options = {
    ...defaultOptions,
    ...options,
  };
  await serveVulcan(options as ServeCommandOptions);
};
