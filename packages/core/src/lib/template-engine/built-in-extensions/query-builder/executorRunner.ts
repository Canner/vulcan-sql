import { FilterRunner } from '../../extension-loader';
import { EXECUTE_FILTER_NAME } from './constants';
import { QueryBuilder } from './reqTagRunner';

export class ExecutorRunner extends FilterRunner {
  public filterName = EXECUTE_FILTER_NAME;

  public async transform({ value }: { value: any; args: any[] }): Promise<any> {
    const builder: QueryBuilder = value;
    return builder.value();
  }
}
