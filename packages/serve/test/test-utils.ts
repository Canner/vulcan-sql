import * as Stream from 'stream';

/* istanbul ignore file */
export const arrayToStream = (data: Array<any>): Stream => {
  return new Stream.Readable({
    objectMode: true,
    read() {
      // make the data push by array order.
      this.push(data.shift() || null);
    },
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
