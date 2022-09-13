import {
  DataResult,
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { streamToArray } from '@vulcan-sql/core/utils';
import { EXECUTE_FILTER_NAME } from './constants';

const isDataResult = (response: any): response is DataResult => {
  return response.getColumns && response.getData;
};

@VulcanInternalExtension()
export class ExecutorRunner extends FilterRunner {
  public filterName = EXECUTE_FILTER_NAME;

  public async transform({
    value: builder,
  }: FilterRunnerTransformOptions): Promise<any> {
    const response = await builder.value();

    // if input value is not a query builder, call the function .value and do nothing.
    if (!isDataResult(response)) return response;

    const { getData } = response;
    const dataStream = getData();
    const data = await streamToArray(dataStream);
    return data;
  }
}
