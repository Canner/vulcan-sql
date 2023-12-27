import { Logger } from 'tslog';
import { AsyncLocalStorage } from 'async_hooks';
import { InternalError } from './errors';
export { Logger as ILogger };
// The category according to package name
export enum LoggingScope {
  CORE = 'CORE',
  BUILD = 'BUILD',
  SERVE = 'SERVE',
  ACCESS_LOG = 'ACCESS_LOG',
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

// The default logger options
const defaultLoggerOptions: LoggerOptions = {
  level: LoggingLevel.DEBUG,
  displayRequestId: false,
  displayFilePath: 'hidden',
  displayFunctionName: false,
};

export type AsyncRequestIdStorage = AsyncLocalStorage<{ requestId: string }>;
class LoggerFactory {
  private loggerMap: { [scope: string]: Logger };
  public readonly asyncReqIdStorage: AsyncRequestIdStorage;

  constructor() {
    this.asyncReqIdStorage = new AsyncLocalStorage();

    this.loggerMap = {
      // Here, create default scope logger, we could add other package or extension logger name in here
      [LoggingScope.CORE]: this.createLogger(LoggingScope.CORE),
      [LoggingScope.BUILD]: this.createLogger(LoggingScope.BUILD),
      [LoggingScope.SERVE]: this.createLogger(LoggingScope.SERVE),
      [LoggingScope.ACCESS_LOG]: this.createLogger(LoggingScope.ACCESS_LOG),
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
      throw new InternalError(
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
    const newLogger = this.createLogger(scopeName, options);
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

  private createLogger(name: string, options?: LoggerOptions) {
    return new Logger({
      name,
      minLevel: options?.level || defaultLoggerOptions.level,
      // use function call for requestId, then when logger get requestId, it will get newest store again
      requestId: () => this.asyncReqIdStorage.getStore()?.requestId as string,
      displayRequestId:
        options?.displayRequestId || defaultLoggerOptions.displayRequestId,
      displayFunctionName:
        options?.displayFunctionName ||
        defaultLoggerOptions.displayFunctionName,
      displayFilePath:
        options?.displayFilePath || defaultLoggerOptions.displayFilePath,
    });
  }
}

const factory = new LoggerFactory();
export const getLogger = factory.getLogger.bind(factory);
export const asyncReqIdStorage = factory.asyncReqIdStorage;
