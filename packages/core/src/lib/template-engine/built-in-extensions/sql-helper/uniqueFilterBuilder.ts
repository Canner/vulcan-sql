import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';

@VulcanInternalExtension()
export class UniqueFilterBuilder extends FilterBuilder {
  public filterName = 'unique';
}
