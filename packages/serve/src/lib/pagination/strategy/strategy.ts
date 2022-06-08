import { KoaRouterContext } from '@route/route-component';

export abstract class PaginationStrategy<T> {
  public abstract transform(ctx: KoaRouterContext): Promise<T>;
}
