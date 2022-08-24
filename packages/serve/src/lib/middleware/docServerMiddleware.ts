import {
  BuiltInMiddleware,
  DocumentServer,
  KoaContext,
  Next,
} from '@vulcan-sql/serve/models';
import {
  VulcanInternalExtension,
  TYPES as CORE_TYPES,
  DocumentOptions,
} from '@vulcan-sql/core';
import { inject, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/containers';
import * as compose from 'koa-compose';

@VulcanInternalExtension()
export class DocServerMiddleware extends BuiltInMiddleware {
  private servers: DocumentServer[] = [];

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @inject(TYPES.Factory_DocumentServer)
    documentServerFactory: interfaces.AutoNamedFactory<DocumentServer>,
    @inject(CORE_TYPES.DocumentOptions) options: DocumentOptions
  ) {
    super(config, name);
    for (const serverType of options.server) {
      this.servers.push(documentServerFactory(serverType));
    }
  }

  public override async onActivate(): Promise<void> {
    for (const serve of this.servers) await serve.activate();
  }

  public async handle(context: KoaContext, next: Next) {
    const execute = compose(
      this.servers.map((server) => server.handle.bind(server))
    );
    await execute(context, next);
  }
}
