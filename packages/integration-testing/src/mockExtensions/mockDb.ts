import {
  DataResult,
  DataSource,
  ExecuteOptions,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { newDb } from 'pg-mem';
import { Stream } from 'stream';

const db = newDb();
db.public.many(`create table users(id uuid, name varchar);
insert into users values ('436193eb-f686-4105-ad7b-b5945276c14a','ivan');
`);

@VulcanExtensionId('pg-mem')
export class MockDataSource extends DataSource {
  public async execute(options: ExecuteOptions): Promise<DataResult> {
    const data = db.public.many(options.statement);
    const readStream = new Stream.Readable({
      objectMode: true,
      read: () => null,
    });
    data.forEach((r) => readStream.push(r));
    readStream.push(null);
    return {
      getColumns: () => {
        return [];
      },
      getData: () => {
        return readStream;
      },
    };
  }
}
