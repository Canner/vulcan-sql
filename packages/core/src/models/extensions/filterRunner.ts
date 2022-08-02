import { TYPES } from '@vulcan-sql/core/types';
import { VulcanExtension } from './decorators';
import { RuntimeExtension } from './templateEngine';

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class FilterRunner<
  V = any,
  C = any
> extends RuntimeExtension<C> {
  abstract filterName: string;
  abstract transform(options: {
    value: V;
    args: Record<string, any>;
  }): Promise<any>;

  public __transform(value: any, ...args: any[]) {
    const callback = args[args.length - 1];
    const otherArgs = args.slice(0, args.length - 1);
    this.transform({
      value,
      args: otherArgs,
    })
      .then((res) => callback(null, res))
      .catch((err) => callback(err, null));
  }
}
