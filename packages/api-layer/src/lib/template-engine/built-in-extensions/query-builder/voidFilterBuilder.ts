import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { VOID_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class VoidFilterBuilder extends FilterBuilder {
  public filterName = VOID_FILTER_NAME;
}
