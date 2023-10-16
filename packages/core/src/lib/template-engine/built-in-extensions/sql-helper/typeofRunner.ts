import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';

@VulcanInternalExtension()
export class TypeofRunner extends FilterRunner {
  public filterName = 'typeof';
  public async transform({
    value,
  }: FilterRunnerTransformOptions): Promise<any> {
    return typeof value;
  }
}
