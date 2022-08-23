import { DataColumn, ExtensionBase, VulcanExtension } from '@vulcan-sql/core';
import { has } from 'lodash';
import * as Stream from 'stream';
import { TYPES } from '../../containers/types';
import { KoaContext } from '@vulcan-sql/serve/models';

export type BodyResponse = {
  data: Stream.Readable;
  columns: DataColumn[];
  [key: string]: any;
};

export const toBuffer = (str: string) => {
  return Buffer.from(str, 'utf8');
};

export interface IFormatter {
  format(
    data: Stream.Readable,
    columns?: DataColumn[]
  ): Stream.Readable | Stream.Transform;

  toResponse(stream: Stream.Readable | Stream.Transform, ctx: KoaContext): void;
  formatToResponse(ctx: KoaContext): void;
}

@VulcanExtension(TYPES.Extension_Formatter)
export abstract class BaseResponseFormatter
  extends ExtensionBase
  implements IFormatter
{
  public formatToResponse(ctx: KoaContext) {
    // keep response body the same if it is not provided by template engine, e.g. document server content ...etc.
    if (!has(ctx.response.body, 'data') || !has(ctx.response.body, 'columns')) {
      return;
    }
    // if response has data and columns.
    const { data, columns } = ctx.response.body as BodyResponse;
    const formatted = this.format(data, columns);
    // set formatted stream to response in context
    this.toResponse(formatted, ctx);
    return;
  }

  /**
   * Define how to format original data stream with option columns to formatted stream.
   * @param data data stream
   * @param columns data columns
   */
  public abstract format(
    data: Stream.Readable,
    columns?: DataColumn[]
  ): Stream.Readable | Stream.Transform;

  /**
   * Define how to set the formatted stream to context in response
   * @param stream formatted stream
   * @param ctx koa context
   */
  public abstract toResponse(
    stream: Stream.Readable | Stream.Transform,
    ctx: KoaContext
  ): void;
}
