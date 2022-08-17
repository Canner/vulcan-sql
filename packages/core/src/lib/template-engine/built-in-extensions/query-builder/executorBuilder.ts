import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { EXECUTE_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class ExecutorBuilder extends FilterBuilder {
  public filterName = EXECUTE_FILTER_NAME;
}
