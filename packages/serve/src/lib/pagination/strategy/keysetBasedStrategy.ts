import {
  normalizeStringValue,
  PaginationMode,
  KeysetPagination,
} from '@vulcan-sql/core';
import { KoaContext } from '@vulcan-sql/serve/models';
import { PaginationStrategy } from './strategy';

export class KeysetBasedStrategy extends PaginationStrategy<KeysetPagination> {
  private keyName?: string;
  constructor(keyName?: string) {
    super();
    this.keyName = keyName;
  }
  public async transform(ctx: KoaContext) {
    if (!this.keyName)
      throw new Error(
        `The keyset pagination need to set "keyName" in schema for indicate what key need to do filter.`
      );
    const checkFelidInQueryString = ['limit', this.keyName].every((field) =>
      Object.keys(ctx.request.query).includes(field)
    );
    if (!checkFelidInQueryString)
      throw new Error(
        `The ${PaginationMode.KEYSET} must provide limit and key name in query string.`
      );
    const limitVal = ctx.request.query['limit'] as string;
    const keyNameVal = ctx.request.query[this.keyName] as string;
    return {
      limit: normalizeStringValue(limitVal, 'limit', Number.name),
      [this.keyName]: normalizeStringValue(
        keyNameVal,
        this.keyName,
        String.name
      ),
    } as KeysetPagination;
  }
}
