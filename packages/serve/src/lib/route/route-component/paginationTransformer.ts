import { KoaContext } from '@vulcan-sql/serve/models';
import {
  APISchema,
  PaginationMode,
  Pagination,
  ConfigurationError,
} from '@vulcan-sql/core';
import {
  CursorBasedStrategy,
  OffsetBasedStrategy,
  KeysetBasedStrategy,
} from '@vulcan-sql/serve/pagination';
import { injectable } from 'inversify';

export interface IPaginationTransformer {
  transform(
    ctx: KoaContext,
    apiSchema: APISchema
  ): Promise<Pagination | undefined>;
}

@injectable()
export class PaginationTransformer {
  public async transform(ctx: KoaContext, apiSchema: APISchema) {
    const { pagination } = apiSchema;

    if (pagination) {
      if (!Object.values(PaginationMode).includes(pagination.mode))
        throw new ConfigurationError(
          `The pagination only support ${Object.keys(PaginationMode)}`
        );

      const offset = new OffsetBasedStrategy();
      const cursor = new CursorBasedStrategy();
      const keyset = new KeysetBasedStrategy(pagination.keyName);
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
