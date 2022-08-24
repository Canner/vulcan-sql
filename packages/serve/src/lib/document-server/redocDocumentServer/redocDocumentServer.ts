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
import * as fs from 'fs';
import * as path from 'path';
import { inject } from 'inversify';

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
    // html index
    this.router.get(`/${this.urlPrefix}`, async (ctx, next) => {
      await next();
      ctx.response.body = this.docContent;
    });
    // spec file
    // TODO: it should be spec.yaml but extension will be removed by response-format/middleware, wait for fixing
    const specUrl = `/${this.urlPrefix}/spec`;
    this.router.get(specUrl, async (ctx, next) => {
      await next();
      ctx.response.body = await this.getSpec(DocumentSpec.oas3);
    });
    // redoc js file
    // redoc's package.json point to bundles/redoc.lib.js file which we can't use directly
    // we should use the file redoc.standalone.js at the same folder instead.
    const redocPath = path.resolve(
      require.resolve('redoc'),
      '..',
      'redoc.standalone.js'
    );
    // TODO: it should be redoc.js but extension will be removed by response-format/middleware, wait for fixing
    const bundleFileUrl = `/${this.urlPrefix}/redoc`;
    this.router.get(bundleFileUrl, async (ctx, next) => {
      await next();
      ctx.response.body = fs.createReadStream(redocPath);
      ctx.set('Content-Type', 'application/javascript');
    });

    // Load template and render it
    const template = await fs.promises.readFile(
      path.resolve(__dirname, 'template', 'redoc.html'),
      'utf-8'
    );
    this.docContent = nunjucks.renderString(template, {
      title: `${this.projectOption.name} - Vulcan`,
      specUrl,
      bundleFileUrl,
    });
  }

  public async handle(
    context: Router.RouterContext,
    next: Next
  ): Promise<void> {
    await this.router.routes()(context, next);
  }
}
