import {
  BuildCommandOptions,
  buildVulcan,
  mergeBuildDefaultOption,
} from './build';
import {
  mergeServeDefaultOption,
  ServeCommandOptions,
  serveVulcan,
} from './serve';
import * as chokidar from 'chokidar';
import * as jsYAML from 'js-yaml';
import { promises as fs } from 'fs';
import * as path from 'path';
import { logger } from '../utils';

const callAfterFulfilled = (func: () => Promise<void>) => {
  let busy = false;
  let waitQueue: (() => void)[] = [];
  const runJob = () => {
    const currentPromises = waitQueue;
    waitQueue = [];
    busy = true;
    func().finally(() => {
      currentPromises.forEach((resolve) => resolve());
      busy = false;
      if (waitQueue.length > 0) runJob();
    });
  };
  const callback = () =>
    new Promise<void>((resolve) => {
      waitQueue.push(resolve);
      if (!busy) runJob();
    });
  return callback;
};

export interface StartCommandOptions {
  watch: boolean;
  config: string;
}

const defaultOptions: StartCommandOptions = {
  config: './vulcan.yaml',
  watch: false,
};

export const mergeStartDefaultOption = (
  options: Partial<StartCommandOptions>
) => {
  return {
    ...defaultOptions,
    ...options,
  } as StartCommandOptions;
};

export const handleStart = async (
  options: Partial<
    StartCommandOptions & BuildCommandOptions & ServeCommandOptions
  >
): Promise<void> => {
  const buildOptions = mergeBuildDefaultOption(options);
  const serveOptions = mergeServeDefaultOption(options);
  const startOptions = mergeStartDefaultOption(options);

  const configPath = path.resolve(process.cwd(), startOptions.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

  let stopServer: (() => Promise<any>) | undefined;

  const restartServer = async () => {
    if (stopServer) await stopServer();
    await buildVulcan(buildOptions);
    stopServer = (await serveVulcan(serveOptions)).stopServer;
  };

  await restartServer();

  if (startOptions.watch) {
    const pathsToWatch: string[] = [];

    // YAML files
    const schemaReader = config['schema-parser']?.['reader'];
    if (schemaReader === 'LocalFile') {
      pathsToWatch.push(
        `${path
          .resolve(config['schema-parser']?.['folderPath'])
          .split(path.sep)
          .join('/')}/**/*.yaml`
      );
    } else {
      logger.warn(
        `We can't watch with schema parser reader: ${schemaReader}, ignore it.`
      );
    }

    // SQL files
    const templateProvider = config['template']?.['provider'];
    if (templateProvider === 'LocalFile') {
      pathsToWatch.push(
        `${path
          .resolve(config['template']?.['folderPath'])
          .split(path.sep)
          .join('/')}/**/*.sql`
      );
    } else {
      logger.warn(
        `We can't watch with template provider: ${templateProvider}, ignore it.`
      );
    }

    const restartWhenFulfilled = callAfterFulfilled(restartServer);
    chokidar
      .watch(pathsToWatch, { ignoreInitial: true })
      .on('all', () => restartWhenFulfilled());

    logger.info(`Start watching changes...`);
  }
};
