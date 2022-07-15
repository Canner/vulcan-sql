/* eslint-disable @typescript-eslint/no-empty-function */
import { has } from 'lodash';
import * as Stream from 'stream';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { DataColumn, getLogger } from '@vulcan-sql/core';
import { isArray, isObject } from 'class-validator';

const logger = getLogger({ scopeName: 'SERVE' });

const PREPEND_UTF8_BOM = '\ufeff';

type ResponseBody = {
  data: Stream.Readable;
  columns: DataColumn[];
  [key: string]: any;
};

/**
 * convert the array string to one line string for csv format
 * @param arrString
 */
export const arrayStringToCsvString = (arrString: string) => {
  return arrString.replace(/^\[/, '').replace(/\\"/g, '""').replace(/\]$/, '');
};

const toBuffer = (str: string) => {
  return Buffer.from(str, 'utf8');
};

/**
 * convert data stream with name of columns to csv stream format
 * @param dataStream source data stream from query result
 * @param columns name of columns
 * @returns
 */
const formatToCsvStream = ({
  dataStream,
  columns,
}: {
  dataStream: Stream.Readable;
  columns: DataColumn[];
}) => {
  const csvStream = new Stream.Readable({
    objectMode: false,
    read: () => null,
  });
  // In order to avoid the non-alphabet characters transform wrong, add PREPEND_UTF8_BOM prefix
  csvStream.push(toBuffer(PREPEND_UTF8_BOM));
  // Add columns name by comma through join for csv title.
  csvStream.push(toBuffer(columns.map((column) => column.name).join()));
  csvStream.push(toBuffer('\n'));

  // Read data stream and convert the format to csv format stream.
  dataStream
    // assume data stream "objectMode" is true to get data row directly. e.g: { name: 'jack', age: 18, hobby:['book', 'travel'] }
    .on('data', (dataRow: any) => {
      // pick value and join it by semicolon, e.g: "\"jack\",18,\"['book', 'travel']\""
      const valuesRow = columns.map((column) =>
        // if value is array or object, stringify to fix in one column, e.g: ['book', 'travel'] => "['book', 'travel']"
        isObject(dataRow[column.name]) || isArray(dataRow[column.name])
          ? JSON.stringify(dataRow[column.name])
          : dataRow[column.name]
      );
      // transform format data to buffer
      const dataBuffer = toBuffer(
        arrayStringToCsvString(JSON.stringify(valuesRow))
      );
      csvStream.push(dataBuffer);
      csvStream.push(toBuffer('\n'));
    })
    .on('error', (err: Error) => {
      logger.debug(`read stream failed, detail error ${err}`);
      throw new Error(`read data in the stream for formatting to csv failed.`);
    })
    .on('end', () => {
      csvStream.push(null);
      logger.info('convert to csv format stream > done.');
    });

  return csvStream;
};

export const respondToCsv = (ctx: KoaRouterContext) => {
  // return empty csv stream data or column is not exist
  if (!has(ctx.response.body, 'data') || !has(ctx.response.body, 'columns')) {
    const stream = new Stream.Readable();
    stream.push(null);
    setCsvToResponse(ctx, stream);
    return;
  }
  // if response has data and columns, convert to csv stream format
  const { data, columns } = ctx.response.body as ResponseBody;
  const csvStream = formatToCsvStream({
    dataStream: data,
    columns,
  });
  // set csv stream to response in context
  setCsvToResponse(ctx, csvStream);
  return;
};

const setCsvToResponse = (ctx: KoaRouterContext, stream: Stream.Readable) => {
  // get file name by url path. e.g: url = '/urls/orders', result = orders
  const size = ctx.url.split('/').length;
  const filename = ctx.url.split('/')[size - 1];
  // set csv stream to response and header to note the stream will download
  ctx.response.body = stream;
  ctx.response.set(
    'Content-disposition',
    `attachment; filename=${filename}.csv`
  );
  ctx.response.set('Content-type', 'text/csv');
};
