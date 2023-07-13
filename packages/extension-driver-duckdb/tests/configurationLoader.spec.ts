import * as duckdb from 'duckdb';
import {
  DuckDBExtensionLoader,
  HTTPFS_CONFIGURATIONS,
} from '../src/lib/duckdbExtensionLoader';

const getQueryResults = (conn: duckdb.Connection, sql: string) =>
  new Promise<any[]>((resolve, reject) => {
    conn.all(sql, (err: any, result: any[]) => {
      err ? reject(err) : resolve(result);
    });
  });

it('Given Configurations should been set into DuckDB session after loadExtension', async () => {
  // Arrange
  const db = new duckdb.Database(':memory:');
  const connection = db.connect();
  connection.run('INSTALL httpfs');
  const configurations = {
    use_ssl: false,
    region: 'us-east-1',
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    endpoint: 'http://localhost:4566',
    url_style: 'path',
    sessionToken: 'sessionToken',
  };
  const configurationLoader = new DuckDBExtensionLoader(configurations);

  // Act
  await configurationLoader.loadExtension(connection, 'httpfs');

  // Assert
  let dbConfigurations = await getQueryResults(
    connection,
    'SELECT * FROM duckdb_settings();'
  );
  dbConfigurations = dbConfigurations.filter(({ name }) =>
    Object.keys(HTTPFS_CONFIGURATIONS).includes(name)
  );

  Object.entries(HTTPFS_CONFIGURATIONS).forEach(
    ([dbParameterName, configurationKey]) => {
      if (Object.keys(configurations).includes(configurationKey)) {
        const dbValue = dbConfigurations.find(
          ({ name }) => name === dbParameterName
        ).value;
        const expectedValue =
          configurations[configurationKey as keyof typeof configurations];
        if (configurationKey === 'use_ssl') {
          expect(dbValue).toEqual('false');
        } else {
          expect(dbValue).toEqual(expectedValue);
        }
      }
    }
  );
}, 500000);

it('Unprovided Configurations should not been set into DuckDB session after loadExtension', async () => {
  // Arrange
  const db = new duckdb.Database(':memory:');
  const connection = db.connect();
  connection.run('INSTALL httpfs');
  const configurations = {
    use_ssl: false,
    region: 'us-east-1',
    //   accessKeyId: 'accessKeyId', // not provided, default is ''
    //   secretAccessKey: 'secretAccessKey', // not provided, default is ''
    endpoint: 'http://localhost:4566',
    url_style: 'path',
    sessionToken: 'sessionToken',
  };
  const unprovidedConfigurations = ['accessKeyId', 'secretAccessKey'];
  const configurationLoader = new DuckDBExtensionLoader(configurations);

  // Act
  await configurationLoader.loadExtension(connection, 'httpfs');

  // Assert
  let dbConfigurations = await getQueryResults(
    connection,
    'SELECT * FROM duckdb_settings();'
  );
  dbConfigurations = dbConfigurations.filter(({ name }) =>
    unprovidedConfigurations.includes(name)
  );
  dbConfigurations.forEach(({ name, value }) => {
    if (unprovidedConfigurations.includes(name)) {
      expect(value).toEqual('');
    }
  });
}, 500000);

it('HTTPFS_CONFIGURATIONS key should be a DuckDB parameter', async () => {
  // Arrange
  const db = new duckdb.Database(':memory:');
  const connection = db.connect();
  //   duckdb will have the configuration after install extension
  await new Promise((resolve, reject) => {
    connection.run('INSTALL httpfs');
    connection.run('LOAD httpfs', (err: any) => {
      if (err) reject(err);
      resolve(true);
    });
  });

  // Assert
  const dbConfigurations = await getQueryResults(
    connection,
    'SELECT * FROM duckdb_settings();'
  );
  const dbConfigurationNames = dbConfigurations.map(({ name }) => name);
  Object.keys(HTTPFS_CONFIGURATIONS).forEach((configurationKey) => {
    expect(dbConfigurationNames).toContain(configurationKey);
  });
}, 500000);
