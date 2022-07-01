import { FilterBuilder } from '../../extension-loader';
import { EXECUTE_FILTER_NAME } from './constants';

export class ExecutorBuilder extends FilterBuilder {
  public filterName = EXECUTE_FILTER_NAME;
}
