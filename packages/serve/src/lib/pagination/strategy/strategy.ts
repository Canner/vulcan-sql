import { KoaRouterContext } from '@vulcan-sql/serve/route';

export abstract class PaginationStrategy<T> {
  public abstract transform(ctx: KoaRouterContext): Promise<T>;
}
