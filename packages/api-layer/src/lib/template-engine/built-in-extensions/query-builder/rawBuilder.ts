import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { RAW_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class RawBuilder extends FilterBuilder {
  public filterName = RAW_FILTER_NAME;
}
