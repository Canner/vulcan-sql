import {
  TYPES as CORE_TYPES,
  VulcanArtifactBuilder,
  VulcanInternalExtension,
  ICoreOptions,
  APISchema,
} from '@vulcan-sql/api-layer';
import { Next } from 'koa';
import * as Router from 'koa-router';
import { CatalogRouter } from '@vulcan-sql/serve/models';
import { inject } from 'inversify';
import { getDocUrlPrefix } from '../document-router/utils';
@VulcanInternalExtension()
export class CatalogRouters extends CatalogRouter {
  private router = new Router();

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ProjectOptions) projectOptions: Partial<ICoreOptions>,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: VulcanArtifactBuilder
  ) {
    super(config, moduleName, projectOptions, artifactBuilder);
  }

  public override async onActivate() {
    this.router.get('/catalog/schemas/:base64UrlPath', async (ctx, next) => {
      await next();
      const { base64UrlPath } = ctx.params;
      const urlPath = Buffer.from(base64UrlPath, 'base64').toString();
      const schemas = await this.getArtifactSchemas();
      const [schema] = schemas.filter((schema) => {
        return schema.urlPath === urlPath;
      });
      if (!schema) {
        ctx.response.status = 404;
        ctx.response.body = 'Not Found';
        return;
      }

      const responseFormatOption =
        this.getProjectOptionsByKey('response-format');
      const baseUrl = `${ctx.protocol}://${ctx.host}`;
      const result = {
        ...schema,
        url: `${baseUrl}/api${schema.urlPath}`,
        apiDocUrl: `${baseUrl}${this.getAPIDocUrl(schema)}`,
        shareKey: this.getShareKey(ctx.request.headers.authorization),
        responseFormat: responseFormatOption.enabled
          ? responseFormatOption?.options || []
          : [],
      };
      ctx.response.body = result;
    });

    this.router.get('/catalog/schemas', async (ctx, next) => {
      await next();
      const schemas = await this.getArtifactSchemas();
      const baseUrl = `${ctx.protocol}://${ctx.host}`;
      const result = schemas.map((schema) => {
        return {
          ...schema,
          url: `${baseUrl}/api${schema.urlPath}`,
          apiDocUrl: `${baseUrl}${this.getAPIDocUrl(schema)}`,
          shareKey: this.getShareKey(ctx.request.headers.authorization),
        };
      });
      ctx.response.body = result;
    });
  }

  private getShareKey(authorization: string | undefined) {
    if (!authorization) return '';

    const authSourceOption = this.getProjectOptionsByKey('auth-source');
    const token = Buffer.from(
      JSON.stringify({ Authorization: authorization })
    ).toString('base64');
    const key = (authSourceOption && authSourceOption?.options?.key) || 'auth';
    return `?${key}=${token}`;
  }

  // Make API doc(redoc) url for catalog
  // redoc generated url path example: /artist/:id -> /doc#operation/get/artist/:id
  private getAPIDocUrl(schema: APISchema) {
    const redocOption = this.getProjectOptionsByKey('redoc');
    const docPath = getDocUrlPrefix(redocOption?.url || '');

    // currently vulcan-sql only support get method
    const operationPrefix = 'operation/get';
    return `/${docPath}#${operationPrefix}${schema.urlPath}`;
  }

  public async handle(
    context: Router.RouterContext,
    next: Next
  ): Promise<void> {
    await this.router.routes()(context, next);
  }
}
