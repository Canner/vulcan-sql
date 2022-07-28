import { AppConfig, BuiltInOptions } from '@vulcan-sql/serve/models';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { isUndefined } from 'lodash';

export abstract class BaseRouteMiddleware {
  protected config: AppConfig;
  // An identifier to check the options set or not in the middlewares section of serve config
  public readonly name: string;
  constructor(name: string, config: AppConfig) {
    this.name = name;
    this.config = config;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: KoaNext
  ): Promise<void>;

  protected getConfig() {
    if (this.config && this.config.middlewares)
      return this.config.middlewares[this.name];
    return undefined;
  }
}

export abstract class BuiltInMiddleware extends BaseRouteMiddleware {
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  constructor(name: string, config: AppConfig) {
    super(name, config);

    const value = this.getConfig()?.['enabled'] as boolean;
    this.enabled = isUndefined(value) ? true : value;
  }
  protected getOptions() {
    if (this.getConfig())
      return this.getConfig()?.['options'] as BuiltInOptions;
    return undefined;
  }
}
