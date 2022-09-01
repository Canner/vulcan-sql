import { Readable } from 'stream';
import * as duckdb from 'duckdb';
import {
  TYPES,
  DataResult,
  DataSource,
  ExecuteOptions,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { inject } from 'inversify';
import * as path from 'path';

const getType = (value: any) => {
  const jsType = typeof value;
  switch (jsType) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    default:
      return 'string';
  }
};

export interface DuckDBOptions {
  'persistent-path'?: string;
  'log-queries'?: boolean;
  'log-parameters'?: boolean;
}

@VulcanExtensionId('duckdb')
export class DuckDBDataSource extends DataSource<DuckDBOptions> {
  private db: duckdb.Database;
  private logger = this.getLogger();

  constructor(
    @inject(TYPES.ExtensionConfig) config: DuckDBOptions,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    if (!this.getConfig()?.['persistent-path']) {
      this.db = new duckdb.Database(':memory:');
    } else {
      this.db = new duckdb.Database(
        path.resolve(process.cwd(), this.getConfig()!['persistent-path']!)
      );
    }
  }

  public async execute({
    statement: sql,
    bindParams,
  }: ExecuteOptions): Promise<DataResult> {
    const statement = this.db.prepare(sql);
    const parameters = Array.from(bindParams.values());
    this.logRequest(sql, parameters);

    const result = await statement.stream(parameters);
    const firstChunk = await result.nextChunk();
    return {
      getColumns: () => {
        if (!firstChunk || firstChunk.length === 0) return [];
        return Object.keys(firstChunk[0]).map((columnName) => ({
          name: columnName,
          type: getType(firstChunk[0][columnName as any]),
        }));
      },
      getData: () => {
        const stream = new Readable({
          objectMode: true,
          read() {
            result.nextChunk().then((chunk) => {
              if (!chunk) {
                this.push(null);
                return;
              }
              for (const row of chunk) {
                this.push(row);
              }
            });
          },
        });
        // Send the first chunk
        for (const row of firstChunk) {
          stream.push(row);
        }
        return stream;
      },
    };
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  private logRequest(sql: string, parameters: string[]) {
    if (this.getConfig()?.['log-queries']) {
      if (this.getConfig()?.['log-parameters']) {
        this.logger.info(sql, parameters);
      } else {
        this.logger.info(sql);
      }
    }
  }
}
