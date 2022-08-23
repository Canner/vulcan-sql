import {
  DocumentOptions,
  DocumentServerType,
  DocumentSpec,
  ProjectOptions,
  TYPES as CORE_TYPES,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import * as nunjucks from 'nunjucks';
import { Next } from 'koa';
import * as Router from 'koa-router';
import { DocumentServer } from '@vulcan-sql/serve/models';
import { promises as fs } from 'fs';
import * as path from 'path';
import { inject } from 'inversify';
import { v4 } from 'uuid';

@VulcanInternalExtension('redoc')
@VulcanExtensionId(DocumentServerType.redoc)
export class RedocDocumentServer extends DocumentServer {
  private router = new Router();
  private docContent = '';
  private projectOption: ProjectOptions;
  // remove leading, trailing slashes
  private urlPrefix =
    this.getConfig()?.url?.replace(/\/+$/, '').replace(/^\/+/, '') || 'doc';

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.DocumentOptions) documentOptions: DocumentOptions,
    @inject(CORE_TYPES.ProjectOptions) projectOption: ProjectOptions
  ) {
    super(config, moduleName, documentOptions);
    this.projectOption = projectOption;
  }

  public override async onActivate() {
    // Set routes
    this.router.get(`/${this.urlPrefix}`, async (ctx, next) => {
      await next();
      ctx.response.body = this.docContent;
    });
    const specUrl = `/${this.urlPrefix}/spec/${v4()}`;
    this.router.get(specUrl, async (ctx, next) => {
      await next();
      ctx.response.body = await this.getSpec(DocumentSpec.oas3);
    });
    // Load template
    const template = await fs.readFile(
      path.resolve(__dirname, 'template', 'redoc.html'),
      'utf-8'
    );
    this.docContent = nunjucks.renderString(template, {
      title: `${this.projectOption.name} - Vulcan`,
      specUrl,
    });
  }

  public async handle(
    context: Router.RouterContext,
    next: Next
  ): Promise<void> {
    await this.router.routes()(context, next);
  }
}
