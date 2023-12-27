import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';

@VulcanInternalExtension()
export class UniqueFilterBuilder extends FilterBuilder {
  public filterName = 'unique';
}
