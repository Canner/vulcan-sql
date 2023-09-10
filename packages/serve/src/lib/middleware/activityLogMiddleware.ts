import {
  TYPES as CORE_TYPES,
  BaseActivityLogger,
  VulcanInternalExtension,
  IActivityLoggerOptions,
  getLogger,
} from '@vulcan-sql/core';
import { Next, KoaContext, BuiltInMiddleware } from '@vulcan-sql/serve/models';
import { inject, multiInject } from 'inversify';
import moment = require('moment');

const logger = getLogger({ scopeName: 'SERVE' });

@VulcanInternalExtension('activity-log')
export class ActivityLogMiddleware extends BuiltInMiddleware<IActivityLoggerOptions> {
  private activityLoggers: BaseActivityLogger<any>[];
  private activityLoggerMap: Record<string, BaseActivityLogger<any>> = {};
  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @multiInject(CORE_TYPES.Extension_ActivityLogger)
    activityLoggers: BaseActivityLogger<any>[]
  ) {
    super(config, name);
    this.activityLoggers = activityLoggers;
  }
  public override async onActivate(): Promise<void> {
    for (const logger of this.activityLoggers) {
      if (logger.isEnabled()) {
        const id = logger.getExtensionId();
        this.activityLoggerMap[id!] = logger;
      }
    }
  }
  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    const logTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const startTime = Date.now();
    await next();
    const endTime = Date.now();
    const duration = endTime - startTime;
    const body = context.response.body as any;
    const error = body?.message;
    const user = context.state.user;
    for (const activityLogger of Object.values(this.activityLoggerMap)) {
      const activityLog = {
        logTime,
        duration,
        method: context.request.method,
        url: context.request.originalUrl,
        ip: context.request.ip,
        header: context.request.header,
        params: context.params,
        query: context.request.query,
        status: context.response.status,
        error,
        user,
      };
      activityLogger.log(activityLog).catch((e) => {
        logger.debug(`Error when logging activity: ${e}`);
      });
    }
  }
}
