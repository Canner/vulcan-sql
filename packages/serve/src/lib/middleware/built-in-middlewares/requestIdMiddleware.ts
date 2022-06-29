import * as uuid from 'uuid';
import { FieldInType, asyncReqIdStorage } from '@vulcan/core';
import { KoaRouterContext } from '@route/.';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export interface RequestIdOptions {
  name: string;
  fieldIn: FieldInType.HEADER | FieldInType.QUERY;
}

export class RequestIdMiddleware extends BuiltInMiddleware {
  private options: RequestIdOptions;

  constructor(config: ServeConfig) {
    super('request-id', config);
    // read request-id options from config.
    this.options = (this.getOptions() as RequestIdOptions) || {
      name: 'X-Request-ID',
      fieldIn: FieldInType.HEADER,
    };
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    if (!this.enabled) await next();
    else {
      const { request } = context;
      const { name, fieldIn } = this.options;

      // if header or query location not found request id, set default to uuid
      const requestId =
        (fieldIn === FieldInType.HEADER
          ? (request.header[name] as string)
          : (request.query[name] as string)) || uuid.v4();

      // keep request id for logger used
      await asyncReqIdStorage.enterWith({ requestId });
      await next();
    }
  }
}
