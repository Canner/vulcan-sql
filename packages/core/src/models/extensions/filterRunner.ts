import { TYPES } from '@vulcan-sql/core/types';
import { VulcanExtension } from './decorators';
import { RuntimeExtension } from './templateEngine';
import { Context } from 'nunjucks';
import { NunjucksExecutionMetadata } from '../../lib/api-layer/template-engine/nunjucksExecutionMetadata';

export interface FilterRunnerTransformOptions<V = any> {
  value: V;
  args: any;
  context: Context;
  metadata: NunjucksExecutionMetadata;
}

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class FilterRunner<
  V = any,
  C = any
> extends RuntimeExtension<C> {
  abstract filterName: string;
  abstract transform(options: FilterRunnerTransformOptions<V>): Promise<any>;

  public __transform(context: Context, value: any, ...args: any[]) {
    const callback = args[args.length - 1];
    const otherArgs = args.slice(0, args.length - 1);
    const metadata = NunjucksExecutionMetadata.load(context);
    this.transform({
      value,
      args: otherArgs,
      context,
      metadata,
    })
      .then((res) => callback(null, res))
      .catch((err) => callback(err, null));
  }
}
