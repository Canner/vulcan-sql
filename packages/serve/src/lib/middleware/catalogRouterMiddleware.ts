import {
  BuiltInMiddleware,
  CatalogRouter,
  KoaContext,
  Next,
} from '@vulcan-sql/serve/models';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/types';

@VulcanInternalExtension()
export class CatalogRouterMiddleware extends BuiltInMiddleware {
  private catalogRouter: CatalogRouter;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @inject(TYPES.Extension_CatalogRouter) catalogRouter: CatalogRouter
  ) {
    super(config, name);
    this.catalogRouter = catalogRouter;
  }

  public override async onActivate(): Promise<void> {
    if (this.catalogRouter.activate) this.catalogRouter.activate();
  }

  public async handle(context: KoaContext, next: Next) {
    const execute = this.catalogRouter.handle.bind(this.catalogRouter);
    await execute(context, next);
  }
}
