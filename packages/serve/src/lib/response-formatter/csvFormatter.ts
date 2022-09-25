import * as Stream from 'stream';
import {
  DataColumn,
  getLogger,
  InternalError,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { isArray, isObject, isUndefined } from 'lodash';
import { KoaContext } from '@vulcan-sql/serve/models';
import {
  BaseResponseFormatter,
  toBuffer,
} from '../../models/extensions/responseFormatter';

const logger = getLogger({ scopeName: 'SERVE' });

/**
 * convert the array string to one line string for csv format
 * @param arrString
 */
export const arrStringToCsvString = (arrString: string) => {
  return arrString.replace(/^\[/, '').replace(/\\"/g, '""').replace(/\]$/, '');
};

class CsvTransformer extends Stream.Transform {
  private columns: string[];
  private readonly PREPEND_UTF8_BOM = '\ufeff';

  constructor({
    columns,
    options,
  }: {
    columns: string[];
    options?: Stream.TransformOptions;
  }) {
    /**
     * make the csv stream source (writable stream) is object mode to get data row directly from data readable stream.
     * make the csv stream transformed destination (readable stream) is not object mode
     */
    options = options || {
      writableObjectMode: true,
      readableObjectMode: false,
    };
    if (isUndefined(options.readableObjectMode))
      options.readableObjectMode = false;
    if (isUndefined(options.writableObjectMode))
      options.writableObjectMode = true;

    super(options);
    this.columns = columns;

    /**
     * add columns name by comma through join for csv title.
     * in order to avoid the non-alphabet characters transform wrong, add PREPEND_UTF8_BOM prefix
     */
    this.push(toBuffer(this.PREPEND_UTF8_BOM));
    this.push(toBuffer(columns.join()));
    this.push(toBuffer('\n'));
  }

  public override _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: Stream.TransformCallback
  ) {
    // chuck => { name: 'jack', age: 18, hobby:['book', 'travel'] }
    // pick value and join it by semicolon, e.g: "\"jack\",18,\"['book', 'travel']\""
    const valuesRow = this.columns.map((column) =>
      // if value is array or object, stringify to fix in one column, e.g: ['book', 'travel'] => "['book', 'travel']"
      isObject(chunk[column]) || isArray(chunk[column])
        ? JSON.stringify(chunk[column])
        : chunk[column]
    );
    // transform format data to buffer
    const dataBuffer = toBuffer(
      arrStringToCsvString(JSON.stringify(valuesRow))
    );
    // run callback and pass the transformed data buffer to transform.push()
    this.push(dataBuffer);
    this.push(toBuffer('\n'));
    callback(null);
  }
}

@VulcanInternalExtension()
@VulcanExtensionId('csv')
export class CsvFormatter extends BaseResponseFormatter {
  public format(data: Stream.Readable, columns?: DataColumn[]) {
    if (!columns) throw new InternalError('must provide columns');
    // create csv transform stream and define transform to csv way.
    const csvStream = new CsvTransformer({
      columns: columns.map((column) => column.name),
    });
    // start to transform data to csv stream
    data
      .pipe(csvStream)
      .on('error', (err) => {
        logger.warn(`read stream failed, detail error ${err}`);
        throw new InternalError(
          `read data in the stream for formatting to csv failed.`
        );
      })
      .on('end', () => {
        logger.debug('convert to csv format stream > done.');
      });

    return csvStream;
  }

  public toResponse(
    stream: Stream.Readable | Stream.Transform,
    ctx: KoaContext
  ) {
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
  }
}
