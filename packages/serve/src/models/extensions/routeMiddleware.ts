import { ExtensionBase, VulcanExtension } from '@vulcan-sql/core';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { inject } from 'inversify';
import { isUndefined } from 'lodash';
import { TYPES } from '../../containers/types';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';

export interface BuiltInMiddlewareConfig<Option = any> {
  enabled: boolean;
  options: Option;
}

@VulcanExtension(TYPES.Extension_RouteMiddleware)
export abstract class BaseRouteMiddleware<C = any> extends ExtensionBase<C> {
  public abstract handle(
    context: KoaRouterContext,
    next: KoaNext
  ): Promise<void>;
}

export abstract class BuiltInMiddleware<
  Option = any
> extends BaseRouteMiddleware<BuiltInMiddlewareConfig<Option>> {
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string
  ) {
    super(config, name);

    const value = this.getConfig()?.['enabled'] as boolean;
    this.enabled = isUndefined(value) ? true : value;
  }

  protected getOptions(): Option | undefined {
    if (this.getConfig()) return this.getConfig()?.['options'] as Option;
    return undefined;
  }
}
