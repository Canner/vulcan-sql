import {
  DataQueryBuilder,
  IDataQueryBuilder,
} from '@vulcan-sql/core/data-query';
import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { EXECUTE_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class ExecutorRunner extends FilterRunner {
  public filterName = EXECUTE_FILTER_NAME;

  public async transform({
    value: builder,
  }: FilterRunnerTransformOptions): Promise<any> {
    // if input value is not query builder, call the function .value and to nothing.
    if (!(builder instanceof DataQueryBuilder)) return builder.value();
    // TODO: convert stream to value
    return builder.value();
  }
}
