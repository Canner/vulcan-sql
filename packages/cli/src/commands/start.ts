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
import { addShutdownJob, logger } from '../utils';

const callAfterFulfilled = (func: (shouldPrepareVulcanEngine: boolean) => Promise<void>) => {
  let busy = false;
  let waitQueue: (() => void)[] = [];
  const runJob = (shouldPrepareVulcanEngine: boolean) => {
    const currentPromises = waitQueue;
    waitQueue = [];
    busy = true;
    func(shouldPrepareVulcanEngine).finally(() => {
      currentPromises.forEach((resolve) => resolve());
      busy = false;
      if (waitQueue.length > 0) runJob(shouldPrepareVulcanEngine);
    });
  };
  const callback = (shouldPrepareVulcanEngine: boolean) =>
    new Promise<void>((resolve) => {
      waitQueue.push(resolve);
      if (!busy) runJob(shouldPrepareVulcanEngine);
    });
  return callback;
};

export interface StartCommandOptions {
  watch: boolean;
  config: string;
  platform?: string;
  pull?: boolean;
}

const defaultOptions: StartCommandOptions = {
  config: './outputs/api-configs/vulcan.yaml',
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
  const serveOptions = mergeServeDefaultOption({shouldRunVulcanEngine: false, ...options});
  const startOptions = mergeStartDefaultOption(options);
  const buildOptions = mergeBuildDefaultOption({shouldStopVulcanEngine: false, isWatchMode: startOptions.watch, ...options});

  const configPath = path.resolve(process.cwd(), startOptions.config);
  const config: any = jsYAML.load(await fs.readFile(configPath, 'utf-8'));

  if (!config['containerPlatform']) logger.warn(`No container platform specified, use default: linux/amd64`);
  serveOptions.platform = config['containerPlatform'] ?? 'linux/amd64';
  startOptions.platform = serveOptions.platform;
  buildOptions.platform = serveOptions.platform;

  let stopServer: (() => Promise<any>) | undefined;

  const restartServer = async (shouldPrepareVulcanEngine: boolean) => {
    if (stopServer) await stopServer();
    try {
      await buildVulcan({...buildOptions, shouldPrepareVulcanEngine});
      stopServer = (await serveVulcan(serveOptions))?.stopServer;
    } catch (e) {
      // Ignore the error to keep watch process works
      if (!startOptions.watch) throw e;
    }
  };

  await restartServer(true);

  if (startOptions.watch) {
    const mdlPathsToWatch: string[] = [];
    const sqlPathsToWatch: string[] = [];

    // MDL files
    logger.warn('At the moment, we only support one mdl file.')
    if ('semantic-model' in config && config['semantic-model']['filePaths']?.length > 0) {
      mdlPathsToWatch.push(
        path.resolve(
          `${config['semantic-model']['folderPath']}/${config['semantic-model']['filePaths'][0]['input']}`
        )
      );
    } else {
      logger.warn(
        `We can't watch with mdl files, ignore it.`
      );
    }

    // YAML files
    const schemaReader = config['schema-parser']?.['reader'];
    if (schemaReader === 'LocalFile') {
      const yamlFolderPath = path.resolve(config['schema-parser']?.['folderPath']).split(path.sep).join('/');
      sqlPathsToWatch.push(`${yamlFolderPath}/**/*.yaml`);
      sqlPathsToWatch.push(`!${yamlFolderPath}/models/**/*.yaml`);
      sqlPathsToWatch.push(`!${yamlFolderPath}/cumulative-metrics/**/*.yaml`);
      sqlPathsToWatch.push(`!${yamlFolderPath}/metrics/**/*.yaml`);
    } else {
      logger.warn(
        `We can't watch with schema parser reader: ${schemaReader}, ignore it.`
      );
    }

    // SQL files
    const templateProvider = config['template']?.['provider'];
    if (templateProvider === 'LocalFile') {
      const sqlFolderPath = path.resolve(config['schema-parser']?.['folderPath']).split(path.sep).join('/');
      sqlPathsToWatch.push(`${sqlFolderPath}/**/*.sql`);
      sqlPathsToWatch.push(`!${sqlFolderPath}/models/**/*.sql`);
      sqlPathsToWatch.push(`!${sqlFolderPath}/cumulative-metrics/**/*.sql`);
      sqlPathsToWatch.push(`!${sqlFolderPath}/metrics/**/*.sql`);
    } else {
      logger.warn(
        `We can't watch with template provider: ${templateProvider}, ignore it.`
      );
    }

    const restartWhenFulfilled = callAfterFulfilled(restartServer);
    const mdlWatcher = chokidar
      .watch(mdlPathsToWatch, { ignoreInitial: true })
      .on('all', () => restartWhenFulfilled(true));
    const sqlWatcher = chokidar
      .watch(sqlPathsToWatch, { ignoreInitial: true })
      .on('all', () => restartWhenFulfilled(false));
    addShutdownJob(async () => {
      logger.info(`Stop watching changes...`);
      await mdlWatcher.close();
      await sqlWatcher.close();
    });
    logger.info(`Start watching changes...`);
  }
};
