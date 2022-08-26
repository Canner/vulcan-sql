import { IDataQueryBuilder } from '@vulcan-sql/core/data-query';
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
    value,
  }: FilterRunnerTransformOptions): Promise<any> {
    const builder: IDataQueryBuilder = value;
    return builder.value();
  }
}
