import { ExtensionBase } from './base';
import { TYPES } from '@vulcan-sql/core/types';
import { VulcanExtension } from './decorators';

export enum ActivityLoggerType {
  HTTP_LOGGER = 'http-logger',
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
    if (!config) return false;
    if (config.enabled === true) return true;
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
