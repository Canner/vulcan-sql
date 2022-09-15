import * as Stream from 'stream';
import {
  getLogger,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import {
  BaseResponseFormatter,
  toBuffer,
} from '../../models/extensions/responseFormatter';
import { isUndefined } from 'lodash';
import { KoaContext } from '@vulcan-sql/serve/models';

const logger = getLogger({ scopeName: 'SERVE' });

class JsonStringTransformer extends Stream.Transform {
  private first: boolean;
  constructor(options?: Stream.TransformOptions) {
    /**
     * make the json stream source (writable stream) is object mode to get data row directly from data readable stream.
     * make the json stream transformed destination (readable stream) is not object mode
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
    this.first = true;
  }
  override _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: Stream.TransformCallback
  ) {
    if (this.first) {
      this.push(toBuffer('['));
      this.first = false;
    } else {
      this.push(toBuffer(','));
    }

    this.push(toBuffer(JSON.stringify(chunk)));
    callback(null);
  }
  override _final(callback: (error?: Error | null) => void) {
    // if first is still true, means no data.
    if (this.first) this.push(toBuffer('['));
    this.push(toBuffer(']'));
    callback(null);
  }
}

@VulcanInternalExtension()
@VulcanExtensionId('json')
export class JsonFormatter extends BaseResponseFormatter {
  public format(data: Stream.Readable) {
    const jsonStream = new JsonStringTransformer();
    // Read data stream and convert the format to json format stream.
    data
      .pipe(jsonStream)
      .on('error', (err: Error) => {
        logger.warn(`read stream failed, detail error ${err}`);
        throw new Error(
          `read data in the stream for formatting to json failed.`
        );
      })
      .on('end', () => {
        logger.debug('convert to json format stream > done.');
      });

    return jsonStream;
  }

  public toResponse(
    stream: Stream.Readable | Stream.Transform,
    ctx: KoaContext
  ) {
    // set json stream to response in context ( data is json stream, no need to convert. )
    ctx.response.body = stream;
    ctx.response.set('Content-type', 'application/json');
  }
}
