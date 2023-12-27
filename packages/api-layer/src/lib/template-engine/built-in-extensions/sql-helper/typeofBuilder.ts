import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';

@VulcanInternalExtension()
export class TypeofBuilder extends FilterBuilder {
  public filterName = 'typeof';
}
