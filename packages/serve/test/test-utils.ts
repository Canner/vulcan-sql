import * as from2 from 'from2';
import * as Stream from 'stream';

/* istanbul ignore file */
export const strToStream = (data: string): Stream => {
  return from2(function (size, next) {
    // if there's no more content
    // left in the string, close the stream.
    if (data.length <= 0) return next(null, null);

    // Pull in a new chunk of text,
    // removing it from the string.
    const chunk = data.slice(0, size);
    data = data.slice(size);

    // Emit "chunk" from the stream.
    next(null, chunk);
  });
};

/* istanbul ignore file */
export const arrayToStream = (data: Array<any>): Stream => {
  return from2.obj(function (_size, next) {
    // if there's no more content
    // left in the string, close the stream.
    if (data.length <= 0) return next(null, null);

    // Pull in a new chunk of text,
    // removing it from the string.
    const chunk = data[0];
    data = data.slice(1);

    // Emit "chunk" from the stream.
    next(null, chunk);
  });
};

export const streamToString = (stream: Stream) => {
  const chunks: any = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};
