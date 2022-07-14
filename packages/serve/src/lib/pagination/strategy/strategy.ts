import { KoaRouterContext } from '@vulcan/serve/route';

export abstract class PaginationStrategy<T> {
  public abstract transform(ctx: KoaRouterContext): Promise<T>;
}
