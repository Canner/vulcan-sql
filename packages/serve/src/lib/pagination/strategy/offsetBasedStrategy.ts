import { KoaContext } from '@vulcan-sql/serve/models';
import {
  normalizeStringValue,
  OffsetPagination,
  UserError,
} from '@vulcan-sql/api-layer';
import { PaginationStrategy } from './strategy';

export class OffsetBasedStrategy extends PaginationStrategy<OffsetPagination> {
  public async transform(ctx: KoaContext) {
    ['limit', 'offset'].forEach((field) => {
      // Reject the request with duplicated query string. e.g. xxxx?limit=10&limit=100
      if (typeof ctx.request.query[field] === 'object')
        throw new UserError(
          `The query string ${field} should be defined once.`
        );
    });

    const limitVal = ctx.request.query['limit'] ?? '20';
    const offsetVal = ctx.request.query['offset'] ?? '0';
    return {
      limit: normalizeStringValue(limitVal as string, 'limit', Number.name),
      offset: normalizeStringValue(offsetVal as string, 'offset', Number.name),
    } as OffsetPagination;
  }
}
