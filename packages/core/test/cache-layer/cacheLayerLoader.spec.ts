import * as fs from 'fs';
import faker from '@faker-js/faker';
import * as duckdb from 'duckdb';
import * as sinon from 'ts-sinon';
import {
  APISchema,
  CacheLayerInfo,
  CacheLayerLoader,
  CacheLayerOptions,
  DataResult,
  DataSource,
  ExportOptions,
  ImportOptions,
  RequestParameter,
  VulcanExtensionId,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core';

let db: duckdb.Database;
const folderPath = 'test-exported-parquets';

const getQueryResults = async (sql: string): Promise<Record<string, any>[]> =>
  new Promise((resolve, reject) => {
    db.wait(() => {
      db.all(sql, (err: any, result: any[]) =>
        err ? reject(err) : resolve(result)
      );
    });
  });

@VulcanExtensionId('mock')
class MockDataSource extends DataSource {
  private logger = this.getLogger();

  public async execute(): Promise<DataResult> {
    return {} as any;
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  public override getProfiles() {
    return super.getProfiles();
  }

  public override getProfile(name: string) {
    return super.getProfile(name);
  }

  public override async export(options: ExportOptions) {
    const { filepath } = options;
    const fakeTableName = faker.word.noun();
    const fakeColumns = [
      {
        column: 'id',
        type: 'INTEGER',
      },
      {
        column: 'username',
        type: 'VARCHAR',
      },
      {
        column: 'is_active',
        type: 'BOOLEAN',
      },
    ];

    // create table by fake columns with types
    db.run(
      `CREATE TABLE ${fakeTableName}(${fakeColumns[0].column} ${fakeColumns[0].type}, ${fakeColumns[1].column} ${fakeColumns[1].type}, ${fakeColumns[2].column} ${fakeColumns[2].type})`
    );
    for (let i = 0; i < 10000; i++) {
      db.run(
        `INSERT INTO ${fakeTableName} VALUES (${faker.random.numeric()}, '${faker.random.word()}', ${faker.datatype.boolean()})`
      );
    }
    // export to parquet
    db.run(`COPY ${fakeTableName} TO '${filepath}' (FORMAT 'parquet')`, () => {
      this.logger.info(`Export to parquet file done, path = ${filepath}`);
    });
  }

  public override async import(options: ImportOptions) {
    const { tableName, filepath, schema } = options;

    db.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    db.run(
      `CREATE TABLE ${schema}.${tableName} AS SELECT * FROM read_parquet(?)`,
      [filepath],
      () => {
        this.logger.info(`Table created, name = ${tableName}`);
      }
    );
  }
}

beforeAll(async () => {
  db = new duckdb.Database(':memory:');
});

afterAll(async () => {
  fs.rmSync(folderPath, { recursive: true, force: true });
});

it('Should preload success when export data to parquet file and load it', async () => {
  // Arrange
  const schemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      templateSource: 'template-1',
      profiles: ['mock1-profile1', 'mock1-profile2'],
      cache: [
        {
          cacheTableName: 'schema1_table1',
          sql: sinon.default.stub() as any,
          profile: 'mock1-profile1',
        },
        {
          cacheTableName: 'schema1_table2',
          sql: sinon.default.stub() as any,
          profile: 'mock1-profile2',
        },
      ] as Array<CacheLayerInfo>,
    },
    {
      ...sinon.stubInterface<APISchema>(),
      templateSource: 'template-2',
      profiles: ['mock2-profile1'],
      cache: [
        {
          cacheTableName: 'schema2_table1',
          sql: sinon.default.stub() as any,
          profile: 'mock2-profile1',
        },
      ] as Array<CacheLayerInfo>,
    },
  ];

  const mockDataSource = new MockDataSource({}, '', [
    {
      name: schemas[0].profiles[0],
      type: 'mock',
      allow: '*',
    },
    {
      name: schemas[0].profiles[1],
      type: 'mock',
      allow: '*',
    },
    {
      name: schemas[1].profiles[0],
      type: 'mock',
      allow: '*',
    },
    {
      name: cacheProfileName,
      type: 'mock',
      allow: '*',
    },
  ]);
  const stubFactory = (profileName: string) => {
    const dataSourceMap = {
      [schemas[0].profiles[0]]: mockDataSource,
      [schemas[0].profiles[1]]: mockDataSource,
      [schemas[1].profiles[0]]: mockDataSource,
      [cacheProfileName]: mockDataSource,
    } as Record<string, DataSource>;
    return dataSourceMap[profileName];
  };
  const options = new CacheLayerOptions({
    folderPath,
  });
  const loader = new CacheLayerLoader(options, stubFactory as any);

  // Act
  await loader.preload(schemas);

  // Assert
  const actual = (
    await getQueryResults(
      "select * from information_schema.tables where table_schema = 'vulcan'"
    )
  ).map((row) => {
    return {
      table: row['table_name'],
      schema: row['table_schema'],
    };
  });
  expect(actual).toEqual(
    expect.arrayContaining([
      {
        table: schemas[0].cache[0].cacheTableName,
        schema: vulcanCacheSchemaName,
      },
      {
        table: schemas[0].cache[1].cacheTableName,
        schema: vulcanCacheSchemaName,
      },
      {
        table: schemas[1].cache[0].cacheTableName,
        schema: vulcanCacheSchemaName,
      },
    ])
  );
}, 500000);

it('Should preload failed when exist duplicate cache table name over than one API schema', async () => {
  // Arrange
  const schemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      templateSource: 'template-1',
      profiles: ['mock1-profile1', 'mock1-profile2'],
      cache: [
        {
          cacheTableName: 'schema1_table1',
          sql: sinon.default.stub() as any,
          profile: 'mock1-profile1',
        },
        {
          cacheTableName: 'schema1_table2',
          sql: sinon.default.stub() as any,
          profile: 'mock1-profile2',
        },
      ] as Array<CacheLayerInfo>,
    },
    {
      ...sinon.stubInterface<APISchema>(),
      templateSource: 'template-2',
      profiles: ['mock2-profile1'],
      cache: [
        {
          // duplicate cache table name
          cacheTableName: 'schema1_table1',
          sql: sinon.default.stub() as any,
          profile: 'mock2-profile1',
        },
        {
          cacheTableName: 'schema2_table1',
          sql: sinon.default.stub() as any,
          profile: 'mock2-profile1',
        },
      ] as Array<CacheLayerInfo>,
    },
  ];
  const mockDataSource = new MockDataSource({}, '', [
    {
      name: schemas[0].profiles[0],
      type: 'mock',
      allow: '*',
    },
    {
      name: schemas[0].profiles[1],
      type: 'mock',
      allow: '*',
    },
    {
      name: schemas[1].profiles[0],
      type: 'mock',
      allow: '*',
    },
    {
      name: cacheProfileName,
      type: 'mock',
      allow: '*',
    },
  ]);
  const stubFactory = (profileName: string) => {
    const dataSourceMap = {
      [schemas[0].profiles[0]]: mockDataSource,
      [schemas[0].profiles[1]]: mockDataSource,
      [schemas[1].profiles[0]]: mockDataSource,
      [cacheProfileName]: mockDataSource,
    } as Record<string, DataSource>;
    return dataSourceMap[profileName];
  };
  const options = new CacheLayerOptions({
    folderPath,
  });
  const loader = new CacheLayerLoader(options, stubFactory as any);

  // Act
  await expect(() => loader.preload(schemas)).rejects.toThrow(
    'Not allow to set same cache table name more than one API schema.'
  );
});
