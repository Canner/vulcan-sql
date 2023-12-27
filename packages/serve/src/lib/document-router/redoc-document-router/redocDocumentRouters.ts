import {
  ArtifactBuilder,
  DocumentRouterType,
  DocumentSpec,
  ProjectOptions,
  TYPES as CORE_TYPES,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer';
import * as nunjucks from 'nunjucks';
import { Next } from 'koa';
import * as Router from 'koa-router';
import { DocumentRouter } from '@vulcan-sql/serve/models';
import * as fs from 'fs';
import * as path from 'path';
import { inject } from 'inversify';
import { getDocUrlPrefix } from '../utils';

@VulcanInternalExtension('redoc')
@VulcanExtensionId(DocumentRouterType.redoc)
export class RedocDocumentRouters extends DocumentRouter {
  private router = new Router();
  private docContent = '';
  private projectOption: ProjectOptions;
  // remove leading, trailing slashes
  private urlPrefix = getDocUrlPrefix(this.getConfig()?.url || '');

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: ArtifactBuilder,
    @inject(CORE_TYPES.ProjectOptions) projectOption: ProjectOptions
  ) {
    super(config, moduleName, artifactBuilder);
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
    // TODO: it should be spec.json but extension will be removed by response-format/middleware, wait for fixing
    const specUrl = `/${this.urlPrefix}/spec`;
    this.router.get(specUrl, async (ctx, next) => {
      await next();
      ctx.response.body = await this.getSpec(DocumentSpec.oas3);
    });
    // redoc js file
    // redoc's package.json point to bundles/redoc.lib.js file which we can't use directly
    // we should use the file redoc.standalone.js at the same folder instead.
    const redocPath = path.resolve(
      __dirname,
      'template',
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
