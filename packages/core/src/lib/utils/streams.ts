import { Readable } from 'stream';

export const arrayToStream = (array: any[]) => {
  let index = 0;
  const stream = new Readable({
    objectMode: true,
    read() {
      if (index >= array.length) {
        this.push(null);
        return;
      }
      this.push(array[index++]);
    },
  });
  return stream;
};

export const streamToArray = (stream: Readable) => {
  const rows: any[] = [];
  return new Promise<any[]>((resolve, reject) => {
    stream.on('data', (data) => {
      rows.push(data);
    });
    stream.on('end', () => {
      resolve(rows);
    });
    stream.on('error', (err) => reject(err));
  });
};
