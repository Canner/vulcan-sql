import * as uuid from 'uuid';
import {
  FieldInType,
  asyncReqIdStorage,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject } from 'inversify';

export interface RequestIdOptions {
  name: string;
  fieldIn: FieldInType.HEADER | FieldInType.QUERY;
}

@VulcanInternalExtension('request-id')
export class RequestIdMiddleware extends BuiltInMiddleware<RequestIdOptions> {
  private options: RequestIdOptions;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string
  ) {
    super(config, name);
    // read request-id options from config.
    this.options = (this.getOptions() as RequestIdOptions) || {
      name: 'X-Request-ID',
      fieldIn: FieldInType.HEADER,
    };
    // if options has value, but not exist name / field, add default value.
    if (!this.options['name']) this.options['name'] = 'X-Request-ID';
    if (!this.options['fieldIn']) this.options['fieldIn'] = FieldInType.HEADER;
  }
  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();

    const { request } = context;
    const { name, fieldIn } = this.options;

    // if header or query location not found request id, set default to uuid
    const requestId =
      (fieldIn === FieldInType.HEADER
        ? // make the name to lowercase for consistency in request, because the field name in request will be lowercase
          (request.header[name.toLowerCase()] as string)
        : (request.query[name.toLowerCase()] as string)) || uuid.v4();

    /**
     * The asyncReqIdStorage.getStore(...) only worked in context of the asyncReqIdStorage.run(...)
     * so here it worked if the asyncReqIdStorage.getStore(...) called in the next function or inner scope of asyncReqIdStorage.run(...)
     * */
    await asyncReqIdStorage.run({ requestId }, async () => {
      await next();
    });
  }
}
