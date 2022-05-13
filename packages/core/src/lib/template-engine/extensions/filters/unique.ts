import { NunjucksFilterExtension } from '../extension';
import { uniq, uniqBy } from 'lodash';

export class UniqueExtension implements NunjucksFilterExtension {
  public name = 'unique';
  public transform({
    value,
    args,
  }: {
    value: any[];
    args: Record<string, any>;
  }): any {
    const { by } = args;
    if (by) {
      return uniqBy(value, by);
    } else {
      return uniq(value);
    }
  }
}
