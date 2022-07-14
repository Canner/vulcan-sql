import { RouterContext as KoaRouterContext } from 'koa-router';
import {
  normalizeStringValue,
  PaginationMode,
  OffsetPagination,
} from '@vulcan-sql/core';
import { PaginationStrategy } from './strategy';

export class OffsetBasedStrategy extends PaginationStrategy<OffsetPagination> {
  public async transform(ctx: KoaRouterContext) {
    const checkFelidInQueryString = ['limit', 'offset'].every((field) =>
      Object.keys(ctx.request.query).includes(field)
    );
    if (!checkFelidInQueryString)
      throw new Error(
        `The ${PaginationMode.OFFSET} must provide limit and offset in query string.`
      );
    const limitVal = ctx.request.query['limit'] as string;
    const offsetVal = ctx.request.query['offset'] as string;
    return {
      limit: normalizeStringValue(limitVal, 'limit', Number.name),
      offset: normalizeStringValue(offsetVal, 'offset', Number.name),
    } as OffsetPagination;
  }
}
