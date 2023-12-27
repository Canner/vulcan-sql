import {
  DataResult,
  DataSource,
  ExecuteOptions,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/api-layer';
import { newDb } from 'pg-mem';
import { Stream } from 'stream';

const db = newDb();

@VulcanExtensionId('pg-mem')
export class MockPGDataSource extends DataSource {
  public static runSQL(sql: string) {
    db.public.many(sql);
  }
  public async execute(options: ExecuteOptions): Promise<DataResult> {
    const { statement, bindParams } = options;
    // handle parameterized query statement
    let query = statement;
    for (const identifier of bindParams.keys()) {
      query = query.replace(
        // escape special char '$'
        new RegExp(identifier.replace('$', '\\$'), 'g'),
        bindParams.get(identifier)!
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
  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }
}
