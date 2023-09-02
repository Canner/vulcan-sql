import { AuthUserInfo, KoaContext } from '@vulcan-sql/serve/models';
import {
  APISchema,
  TemplateEngine,
  Pagination,
  UserError,
} from '@vulcan-sql/core';
import { IRequestValidator } from './requestValidator';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IPaginationTransformer } from './paginationTransformer';
import { Evaluator } from '@vulcan-sql/serve/evaluator';
import { KoaRequest, IncomingHttpHeaders } from '@vulcan-sql/core';

export interface TransformedRequest {
  reqParams: RequestParameters;
  pagination?: Pagination;
}

export interface RouteOptions {
  apiSchema: APISchema;
  reqTransformer: IRequestTransformer;
  reqValidator: IRequestValidator;
  paginationTransformer: IPaginationTransformer;
  templateEngine: TemplateEngine;
  evaluator: Evaluator;
}

export interface IRoute {
  respond(ctx: KoaContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  protected readonly reqTransformer: IRequestTransformer;
  protected readonly reqValidator: IRequestValidator;
  protected readonly templateEngine: TemplateEngine;
  protected readonly paginationTransformer: IPaginationTransformer;
  private evaluator: Evaluator;

  // TODO: Too many injection from constructor, we should try to use container or compose some components
  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
    paginationTransformer,
    templateEngine,
    evaluator,
  }: RouteOptions) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
    this.paginationTransformer = paginationTransformer;
    this.templateEngine = templateEngine;
    this.evaluator = evaluator;
  }

  public abstract respond(ctx: KoaContext): Promise<any>;

  protected abstract prepare(ctx: KoaContext): Promise<TransformedRequest>;

  protected async handle(
    user: AuthUserInfo,
    transformed: TransformedRequest,
    req: KoaRequest,
    headers: IncomingHttpHeaders
  ) {
    const { reqParams, pagination } = transformed;
    // could template name or template path, use for template engine
    const { templateSource, profiles } = this.apiSchema;

    const profile = this.evaluator.evaluateProfile(user, profiles);
    if (!profile)
      throw new UserError(`No profile found`, {
        httpCode: 403,
        code: 'vulcan.forbidden',
      });

    const result = await this.templateEngine.execute(
      templateSource,
      {
        parameters: reqParams,
        user,
        req,
        profileName: profile,
        headers: headers,
      },
      pagination
    );
    return result;
  }
}
