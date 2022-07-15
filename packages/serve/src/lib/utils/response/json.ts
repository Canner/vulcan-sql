/* eslint-disable @typescript-eslint/no-empty-function */
import { has } from 'lodash';
import * as Stream from 'stream';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { DataColumn, getLogger } from '@vulcan-sql/core';

const logger = getLogger({ scopeName: 'SERVE' });

type ResponseBody = {
  data: Stream.Readable;
  columns: DataColumn[];
  [key: string]: any;
};

const toBuffer = (str: string) => {
  return Buffer.from(str, 'utf8');
};

/**
 * convert data stream with name of columns to json stream format
 * @param dataStream source data stream from query result
 * @returns
 */
const formatToJsonStream = ({
  dataStream,
}: {
  dataStream: Stream.Readable;
}) => {
  const jsonStream = new Stream.Readable({
    objectMode: false,
    read: () => null,
  });

  const dataResult: string[] = [];
  // Read data stream and convert the format to json format stream.
  dataStream
    // assume data stream "objectMode" is true to get data row directly. e.g: { name: 'jack', age: 18, hobby:['book', 'travel'] }
    .on('data', (dataRow: any) => {
      // collect and stringify all data rows
      dataResult.push(JSON.stringify(dataRow));
    })
    .on('error', (err: Error) => {
      logger.debug(`read stream failed, detail error ${err}`);
      throw new Error(`read data in the stream for formatting to json failed.`);
    })
    .on('end', () => {
      // transform format data to buffer
      jsonStream.push(toBuffer('['));
      jsonStream.push(toBuffer(dataResult.join()));
      jsonStream.push(toBuffer(']'));
      jsonStream.push(null);
      logger.info('convert to json format stream > done.');
    });

  return jsonStream;
};

export const respondToJson = (ctx: KoaRouterContext) => {
  // return empty csv stream data or column is not exist
  if (!has(ctx.response.body, 'data') || !has(ctx.response.body, 'columns')) {
    const stream = new Stream.Readable();
    stream.push(null);
    // set csv stream to response and header to note the json format
    ctx.response.body = stream;
    ctx.response.set('Content-type', 'application/json');
    return;
  }
  // if response has data and columns.
  const { data } = ctx.response.body as ResponseBody;
  const jsonStream = formatToJsonStream({ dataStream: data });
  // set json stream to response in context ( data is json stream, no need to convert. )
  ctx.response.body = jsonStream;
  ctx.response.set('Content-type', 'application/json');
  return;
};
