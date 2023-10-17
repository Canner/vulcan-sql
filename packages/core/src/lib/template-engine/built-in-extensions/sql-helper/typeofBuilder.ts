import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';

@VulcanInternalExtension()
export class TypeofBuilder extends FilterBuilder {
  public filterName = 'typeof';
}
