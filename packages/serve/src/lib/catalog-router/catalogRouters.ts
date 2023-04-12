import {
  TYPES as CORE_TYPES,
  VulcanArtifactBuilder,
  VulcanExtensionId,
  VulcanInternalExtension,
  ICoreOptions,
  APISchema,
} from '@vulcan-sql/core';
import { Next } from 'koa';
import * as Router from 'koa-router';
import { CatalogRouter } from '@vulcan-sql/serve/models';
import { inject } from 'inversify';

@VulcanInternalExtension('catalog')
@VulcanExtensionId('catalog')
export class CatalogRouters extends CatalogRouter {
  private router = new Router();

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ProjectOptions) projectOptions: ICoreOptions,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: VulcanArtifactBuilder
  ) {
    super(config, moduleName, projectOptions, artifactBuilder);
  }

  public override async onActivate() {
    this.router.get('/catalog/schemas/:sourceName', async (ctx, next) => {
      await next();
      const { sourceName } = ctx.params;
      const schemas = await this.getArtifactSchemas();
      const [schema] = schemas.filter((schema) => {
        return (
          (schema as APISchema & { sourceName: string }).sourceName ===
          sourceName
        );
      });
      if (!schema) {
        ctx.response.status = 404;
        ctx.response.body = 'Not Found';
        return;
      }

      const baseUrl = `${ctx.protocol}://${ctx.host}`;
      const result = {
        ...schema,
        url: `${baseUrl}/api${schema.urlPath}`,
        apiDocUrl: `${baseUrl}${this.getAPIDocUrl(schema)}`,
        shareKey: this.getShareKey(ctx.request.headers.authorization),
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

    const project = this.getProjectOptions();
    const authSource = project?.['auth-source'];
    const token = Buffer.from(
      JSON.stringify({ Authorization: authorization })
    ).toString('base64');
    const key = (authSource && authSource?.options?.key) || 'auth';
    return `?${key}=${token}`;
  }

  private getAPIDocUrl(schema: APISchema) {
    const splitUrl = schema.urlPath.split('/');
    const restructureUrl = splitUrl
      .map((brick) =>
        brick.startsWith(':') ? `{${brick.replace(':', '')}}` : brick
      )
      .join('~1');
    const project = this.getProjectOptions();
    const redoc = project?.['redoc'];
    const docPath =
      redoc?.url?.replace(/\/+$/, '').replace(/^\/+/, '') || 'doc';
    // currently vulcan-sql only support get method
    return `/${docPath}#/paths/${encodeURI(restructureUrl)}/get`;
  }

  public async handle(
    context: Router.RouterContext,
    next: Next
  ): Promise<void> {
    await this.router.routes()(context, next);
  }
}
