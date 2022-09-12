import { Logger } from 'tslog';
import { AsyncLocalStorage } from 'async_hooks';
export { Logger as ILogger };
// The category according to package name
export enum LoggingScope {
  CORE = 'CORE',
  BUILD = 'BUILD',
  SERVE = 'SERVE',
  AUDIT = 'AUDIT',
}

type LoggingScopeTypes = keyof typeof LoggingScope;

export enum LoggingLevel {
  SILLY = 'silly',
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

type DisplayFilePathTypes = 'hidden' | 'displayAll' | 'hideNodeModulesOnly';

export interface LoggerOptions {
  level?: LoggingLevel;
  displayRequestId?: boolean;
  displayFunctionName?: boolean;
  displayFilePath?: DisplayFilePathTypes;
}

type LoggerMapConfig = {
  [scope in LoggingScope]: LoggerOptions;
};

const defaultMapConfig: LoggerMapConfig = {
  [LoggingScope.CORE]: {
    level: LoggingLevel.DEBUG,
    displayRequestId: false,
    displayFilePath: 'hideNodeModulesOnly',
    displayFunctionName: true,
  },
  [LoggingScope.BUILD]: {
    level: LoggingLevel.DEBUG,
    displayRequestId: false,
    displayFilePath: 'hideNodeModulesOnly',
    displayFunctionName: true,
  },
  [LoggingScope.SERVE]: {
    level: LoggingLevel.DEBUG,
    displayRequestId: false,
    displayFilePath: 'hideNodeModulesOnly',
    displayFunctionName: true,
  },
  [LoggingScope.AUDIT]: {
    level: LoggingLevel.DEBUG,
    displayRequestId: false,
    displayFilePath: 'hidden',
    displayFunctionName: false,
  },
};

export type AsyncRequestIdStorage = AsyncLocalStorage<{ requestId: string }>;
class LoggerFactory {
  private loggerMap: { [scope: string]: Logger };
  public readonly asyncReqIdStorage: AsyncRequestIdStorage;

  constructor() {
    this.asyncReqIdStorage = new AsyncLocalStorage();

    this.loggerMap = {
      [LoggingScope.CORE]: this.createLogger(LoggingScope.CORE),
      [LoggingScope.BUILD]: this.createLogger(LoggingScope.BUILD),
      [LoggingScope.SERVE]: this.createLogger(LoggingScope.SERVE),
    };
  }

  public getLogger({
    scopeName,
    options,
  }: {
    scopeName: LoggingScopeTypes;
    options?: LoggerOptions;
  }) {
    if (!(scopeName in LoggingScope))
      throw new Error(
        `The ${scopeName} does not belong to ${Object.keys(LoggingScope)}`
      );
    // if scope name exist in mapper and not update config
    if (scopeName in this.loggerMap) {
      if (!options) return this.loggerMap[scopeName];
      // if options existed, update settings.
      const logger = this.loggerMap[scopeName];
      this.updateSettings(logger, options);
      return logger;
    }
    // if scope name does not exist in map or exist but would like to update config
    const newLogger = this.createLogger(scopeName as LoggingScope, options);
    this.loggerMap[scopeName] = newLogger;
    return newLogger;
  }

  private updateSettings(logger: Logger, options: LoggerOptions) {
    const prevSettings = logger.settings;
    logger.setSettings({
      minLevel: options.level || prevSettings.minLevel,
      displayRequestId:
        options.displayRequestId || prevSettings.displayRequestId,
      displayFunctionName:
        options.displayFunctionName || prevSettings.displayFunctionName,
      displayFilePath: options.displayFilePath || prevSettings.displayFilePath,
    });
  }

  private createLogger(name: LoggingScope, options?: LoggerOptions) {
    return new Logger({
      name,
      minLevel: options?.level || defaultMapConfig[name].level,
      // use function call for requestId, then when logger get requestId, it will get newest store again
      requestId: () => this.asyncReqIdStorage.getStore()?.requestId as string,
      displayRequestId:
        options?.displayRequestId || defaultMapConfig[name].displayRequestId,
      displayFunctionName:
        options?.displayFunctionName ||
        defaultMapConfig[name].displayFunctionName,
      displayFilePath:
        options?.displayFilePath || defaultMapConfig[name].displayFilePath,
    });
  }
}

const factory = new LoggerFactory();
export const getLogger = factory.getLogger.bind(factory);
export const asyncReqIdStorage = factory.asyncReqIdStorage;
