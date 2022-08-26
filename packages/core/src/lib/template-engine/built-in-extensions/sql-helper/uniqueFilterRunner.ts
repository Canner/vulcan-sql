import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { uniq, uniqBy } from 'lodash';

@VulcanInternalExtension()
export class UniqueFilterRunner extends FilterRunner {
  public filterName = 'unique';
  public async transform({
    value,
    args,
  }: FilterRunnerTransformOptions): Promise<any> {
    if (args.length === 0) {
      return uniq(value);
    }
    if (typeof args[0] === 'string') {
      return uniqBy(value, args[0]);
    } else {
      return uniqBy(value, args[0].by);
    }
  }
}
