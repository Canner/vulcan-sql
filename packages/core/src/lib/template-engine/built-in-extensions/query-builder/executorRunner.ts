import { IDataQueryBuilder } from '@vulcan/core/data-query';
import { FilterRunner } from '../../extension-loader';
import { EXECUTE_FILTER_NAME } from './constants';

export class ExecutorRunner extends FilterRunner {
  public filterName = EXECUTE_FILTER_NAME;

  public async transform({ value }: { value: any; args: any[] }): Promise<any> {
    const builder: IDataQueryBuilder = value;
    return builder.value();
  }
}
