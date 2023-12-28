import * as nunjucks from 'nunjucks';
import {
  TagRunner,
  TagRunnerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { InternalError } from '../../../utils/errors';

@VulcanInternalExtension()
export class MaskingTagRunner extends TagRunner {
  public tags = ['masking'];

  public async run({ args }: TagRunnerOptions) {
    const columnName = args[0];
    const prefix = args[1];
    const prefixValue = args[2];
    const padding = args[3];
    const suffix = args[4];
    const suffixValue = args[5];

    if (prefixValue === undefined || suffixValue === undefined) {
      throw new InternalError(`The parameter is invalid`);
    }

    if (typeof prefixValue !== 'number' || typeof suffixValue !== 'number') {
      throw new InternalError(`The parameter is not number type`);
    }

    const suffixNumber = Number(suffixValue);
    const unmaskedLength = Number(prefixValue) + suffixNumber;
    const condition = `(length(${columnName}) > ${unmaskedLength})`;
    const prefixSql = `substr(${columnName}, 1, ${prefix})`;
    const pos = suffixNumber - 1;
    const suffixSql = `substr(${columnName}, length(${columnName}) - ${pos}, ${suffix})`;
    const result =
      suffixNumber === 0
        ? `concat(${prefixSql}, ${padding})`
        : `concat(${prefixSql}, ${padding}, ${suffixSql})`;

    // Consider the currently supported connector, using a general function to implement it.
    return new nunjucks.runtime.SafeString(
      `CASE WHEN ${condition} THEN ${result} ELSE ${padding} END`
    );
  }
}
