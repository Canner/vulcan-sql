import {
  IdentifierParameters,
  BindParameters,
  DataResult,
  DataSource,
  ExecuteOptions,
  RequestParameters,
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
    const { statement, bindParams } = options;
    // handle parameterized query statement
    let query = statement;
    for (const identifier of Object.keys(bindParams)) {
      query = query.replace(
        // escape special char '$'
        new RegExp(identifier.replace('$', '\\$'), 'g'),
        bindParams[identifier]
      );
    }

    // query result
    const data = db.public.many(query);
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
  public async prepare(params: RequestParameters) {
    const identifiers = {} as IdentifierParameters;
    const binds = {} as BindParameters;
    let index = 1;
    for (const key of Object.keys(params)) {
      const identifier = `$${index}`;
      identifiers[key] = identifier;
      binds[identifier] = params[key];
      index += 1;
    }
    return {
      identifiers,
      binds,
    };
  }
}
