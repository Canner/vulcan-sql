import { KoaContext } from '@vulcan-sql/serve/models';

export abstract class PaginationStrategy<T> {
  public abstract transform(ctx: KoaContext): Promise<T>;
}
