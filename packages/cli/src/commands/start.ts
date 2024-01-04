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
import { handleStop } from './stop';

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
  platform: string;
  pull?: boolean;
}

const defaultOptions: StartCommandOptions = {
  config: './configs/vulcan.yaml',
  watch: false,
  platform: 'linux/amd64',
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

  let stopServer: (() => Promise<any>) | undefined;

  const restartServer = async () => {
    if (stopServer) await stopServer();
    try {
      await buildVulcan(buildOptions);
      stopServer = (await serveVulcan(serveOptions))?.stopServer;
    } catch (e) {
      // Ignore the error to keep watch process works
      if (!startOptions.watch) throw e;
    }
  };

  await restartServer();

  if (startOptions.watch) {
    const pathsToWatch: string[] = [];

    // MDL files
    logger.warn('At the moment, we only support one mdl file.')
    if ('semantic-model' in config && config['semantic-model']['filePaths']?.length > 0) {
      pathsToWatch.push(
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
      pathsToWatch.push(`${yamlFolderPath}/**/*.yaml`);
      pathsToWatch.push(`!${yamlFolderPath}/models/**/*.yaml`);
      pathsToWatch.push(`!${yamlFolderPath}/cumulative-metrics/**/*.yaml`);
      pathsToWatch.push(`!${yamlFolderPath}/metrics/**/*.yaml`);
    } else {
      logger.warn(
        `We can't watch with schema parser reader: ${schemaReader}, ignore it.`
      );
    }

    // SQL files
    const templateProvider = config['template']?.['provider'];
    if (templateProvider === 'LocalFile') {
      const sqlFolderPath = path.resolve(config['schema-parser']?.['folderPath']).split(path.sep).join('/');
      pathsToWatch.push(`${sqlFolderPath}/**/*.sql`);
      pathsToWatch.push(`!${sqlFolderPath}/models/**/*.sql`);
      pathsToWatch.push(`!${sqlFolderPath}/cumulative-metrics/**/*.sql`);
      pathsToWatch.push(`!${sqlFolderPath}/metrics/**/*.sql`);
    } else {
      logger.warn(
        `We can't watch with template provider: ${templateProvider}, ignore it.`
      );
    }

    const restartWhenFulfilled = callAfterFulfilled(restartServer);
    const watcher = chokidar
      .watch(pathsToWatch, { ignoreInitial: true })
      .on('all', () => restartWhenFulfilled());
    addShutdownJob(async () => {
      logger.info(`Stop watching changes...`);
      await watcher.close();
    });
    logger.info(`Start watching changes...`);
  }
};
