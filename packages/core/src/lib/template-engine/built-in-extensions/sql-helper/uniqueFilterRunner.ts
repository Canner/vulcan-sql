import { uniq, uniqBy } from 'lodash';
import { FilterRunner } from '../../extension-loader';

export class UniqueFilterRunner extends FilterRunner {
  public filterName = 'unique';
  public async transform({
    value,
    args,
  }: {
    value: any[];
    args: any[];
  }): Promise<any> {
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
