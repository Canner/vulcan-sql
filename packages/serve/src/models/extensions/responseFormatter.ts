import { DataColumn, ExtensionBase, VulcanExtension } from '@vulcan-sql/core';
import { has } from 'lodash';
import * as Stream from 'stream';
import { TYPES } from '../../containers/types';
import { KoaRouterContext } from '../../lib/route';

export type BodyResponse = {
  data: Stream.Readable;
  columns: DataColumn[];
  [key: string]: any;
};

export const toBuffer = (str: string) => {
  return Buffer.from(str, 'utf8');
};

export interface IFormatter {
  // format name, e.g: json, csv
  readonly name: string;

  format(
    data: Stream.Readable,
    columns?: DataColumn[]
  ): Stream.Readable | Stream.Transform;

  toResponse(
    stream: Stream.Readable | Stream.Transform,
    ctx: KoaRouterContext
  ): void;
  formatToResponse(ctx: KoaRouterContext): void;
}

@VulcanExtension(TYPES.Extension_Formatter)
export abstract class BaseResponseFormatter
  extends ExtensionBase
  implements IFormatter
{
  public abstract readonly name: string;
  public formatToResponse(ctx: KoaRouterContext) {
    // return empty csv stream data or column is not exist
    if (!has(ctx.response.body, 'data') || !has(ctx.response.body, 'columns')) {
      const stream = new Stream.Readable();
      stream.push(null);
      this.toResponse(stream, ctx);
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
    ctx: KoaRouterContext
  ): void;
}
