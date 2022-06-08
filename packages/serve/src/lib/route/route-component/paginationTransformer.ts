import { KoaRouterContext } from '@route/route-component';
import { APISchema, PaginationMode } from '@vulcan/core';
import {
  CursorPagination,
  OffsetPagination,
  KeysetPagination,
  CursorBasedStrategy,
  OffsetBasedStrategy,
  KeysetBasedStrategy,
} from '@pagination/.';

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
      if (!(pagination.mode in PaginationMode))
        throw new Error(
          `The pagination only support ${Object.keys(PaginationMode)}`
        );
      const strategyMapper = {
        [PaginationMode.OFFSET]: new OffsetBasedStrategy().transform,
        [PaginationMode.CURSOR]: new CursorBasedStrategy().transform,
        [PaginationMode.KEYSET]: new KeysetBasedStrategy(pagination).transform,
      };
      return await strategyMapper[pagination.mode](ctx);
    }
    return undefined;
  }
}
