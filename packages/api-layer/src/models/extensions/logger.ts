import { ExtensionBase } from './base';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { VulcanExtension } from './decorators';
import { isEmpty } from 'lodash';

export enum ActivityLoggerType {
  HTTP_LOGGER = 'http-logger',
}

export enum ActivityLogType {
  CACHE_REFRESH = 'cache-refresh',
  API_REQUEST = 'api-request',
}
export interface ActivityLogContentOptions {
  isSuccess: boolean;
  activityLogType: ActivityLogType;
}
export interface IActivityLogger {
  isEnabled(): boolean;
  log(content: any): Promise<void>;
}

@VulcanExtension(TYPES.Extension_ActivityLogger, { enforcedId: true })
export abstract class BaseActivityLogger<ActivityLoggerTypeOption>
  extends ExtensionBase
  implements IActivityLogger
{
  public abstract log(context: any): Promise<void>;

  public isEnabled(): boolean {
    const config = this.getConfig();
    if (!config || isEmpty(config)) return false;
    if (!config.enabled) return false;
    if (!config['options']) return false;
    if (config['options'][this.getExtensionId()!]) return true;
    else return false;
  }

  protected getOptions(): ActivityLoggerTypeOption | undefined {
    if (!this.getConfig()) return undefined;
    if (!this.getConfig()['options']) return undefined;
    const option = this.getConfig()['options'][
      this.getExtensionId()!
    ] as ActivityLoggerTypeOption;
    return option;
  }
}
