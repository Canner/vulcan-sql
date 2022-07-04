import { KoaRouterContext } from '@vulcan/serve/route';
import { APISchema, PaginationMode } from '@vulcan/core';
import {
  CursorPagination,
  OffsetPagination,
  KeysetPagination,
  CursorBasedStrategy,
  OffsetBasedStrategy,
  KeysetBasedStrategy,
} from '@vulcan/serve/pagination';

export type Pagination = CursorPagination | OffsetPagination | KeysetPagination;

export interface IPaginationTransformer {
  transform(
    ctx: KoaRouterContext,
    apiSchema: APISchema
  ): Promise<Pagination | undefined>;
}
export class PaginationTransformer {
  public async transform(ctx: KoaRouterContext, apiSchema: APISchema) {
    const { pagination } = apiSchema;

    if (pagination) {
      if (!Object.values(PaginationMode).includes(pagination.mode))
        throw new Error(
          `The pagination only support ${Object.keys(PaginationMode)}`
        );

      const offset = new OffsetBasedStrategy();
      const cursor = new CursorBasedStrategy();
      const keyset = new KeysetBasedStrategy(pagination);
      const strategyMapper = {
        [PaginationMode.OFFSET]: offset.transform.bind(offset),
        [PaginationMode.CURSOR]: cursor.transform.bind(cursor),
        [PaginationMode.KEYSET]: keyset.transform.bind(keyset),
      };
      return await strategyMapper[pagination.mode](ctx);
    }
    return undefined;
  }
}
