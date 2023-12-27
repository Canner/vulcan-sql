import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { RAW_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class RawRunner extends FilterRunner {
  public filterName = RAW_FILTER_NAME;

  public async transform({
    value,
  }: FilterRunnerTransformOptions): Promise<any> {
    // Do nothing, this filer is only a place holder to block sanitizer
    return value;
  }
}
