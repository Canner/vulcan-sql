import { normalizeStringValue, PaginationMode } from '@vulcan/core';
import { KoaRouterContext } from '@vulcan/serve/route';
import { PaginationStrategy } from './strategy';

export interface OffsetPagination {
  limit: number;
  offset: number;
}

export class OffsetBasedStrategy extends PaginationStrategy<OffsetPagination> {
  public async transform(ctx: KoaRouterContext) {
    const checkFelidInHeader = ['limit', 'offset'].every((field) =>
      Object.keys(ctx.request.query).includes(field)
    );
    if (!checkFelidInHeader)
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
