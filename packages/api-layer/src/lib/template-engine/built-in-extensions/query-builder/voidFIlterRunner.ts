import { FilterRunner, VulcanInternalExtension } from '@vulcan-sql/api-layer/models';
import { VOID_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class VoidFilterRunner extends FilterRunner {
  public filterName = VOID_FILTER_NAME;

  public async transform(): Promise<any> {
    // Return undefined no matter what input value is.
    // This filter is useful when we don't we to output the result. e.g. {{ arr.push(1) | void }}
    return undefined;
  }
}
