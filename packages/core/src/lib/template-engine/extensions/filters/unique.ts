import { NunjucksFilterExtension } from '../extension';
import { uniq, uniqBy } from 'lodash';
import { injectable } from 'inversify';

@injectable()
export class UniqueExtension implements NunjucksFilterExtension {
  public name = 'unique';
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
