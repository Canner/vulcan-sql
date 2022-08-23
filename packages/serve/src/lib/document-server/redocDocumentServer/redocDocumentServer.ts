import {
  DocumentServerType,
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

@VulcanInternalExtension('redoc')
@VulcanExtensionId(DocumentServerType.redoc)
export class RedocDocumentServer extends DocumentServer {
  private router = new Router();
  private docContent = '';
  private projectOption: ProjectOptions;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ProjectOptions) projectOption: ProjectOptions
  ) {
    super(config, moduleName);
    this.projectOption = projectOption;
  }

  public override async onActivate() {
    // Set routes
    this.router.get('/doc', async (ctx, next) => {
      await next();
      ctx.response.body = this.docContent;
    });
    // Load template
    const template = await fs.readFile(
      path.resolve(__dirname, 'template', 'redoc.html'),
      'utf-8'
    );
    this.docContent = nunjucks.renderString(template, {
      title: `${this.projectOption.name} - Vulcan`,
    });
  }

  public async handle(
    context: Router.RouterContext,
    next: Next
  ): Promise<void> {
    await this.router.routes()(context, next);
  }
}
