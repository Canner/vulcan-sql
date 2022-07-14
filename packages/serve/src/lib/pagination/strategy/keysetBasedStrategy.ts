import {
  normalizeStringValue,
  PaginationMode,
  PaginationSchema,
  KeysetPagination,
} from '@vulcan-sql/core';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { PaginationStrategy } from './strategy';

export class KeysetBasedStrategy extends PaginationStrategy<KeysetPagination> {
  private pagination: PaginationSchema;
  constructor(pagination: PaginationSchema) {
    super();
    this.pagination = pagination;
  }
  public async transform(ctx: KoaRouterContext) {
    if (!this.pagination.keyName)
      throw new Error(
        `The keyset pagination need to set "keyName" in schema for indicate what key need to do filter.`
      );
    const { keyName } = this.pagination;
    const checkFelidInQueryString = ['limit', keyName].every((field) =>
      Object.keys(ctx.request.query).includes(field)
    );
    if (!checkFelidInQueryString)
      throw new Error(
        `The ${PaginationMode.KEYSET} must provide limit and offset in query string.`
      );
    const limitVal = ctx.request.query['limit'] as string;
    const keyNameVal = ctx.request.query[keyName] as string;
    return {
      limit: normalizeStringValue(limitVal, 'limit', Number.name),
      [keyName]: normalizeStringValue(keyNameVal, keyName, String.name),
    } as KeysetPagination;
  }
}
