import * as path from 'path';
import * as supertest from 'supertest';
import * as fs from 'fs';
import { ServeConfig, VulcanServer } from '@vulcan-sql/serve';
import { MockDuckDBDataSource } from '../mockExtensions';
import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import {
  CacheLayerStoreFormatType,
  CacheLayerStoreLoaderType,
  ICacheLayerOptions,
} from '@vulcan-sql/core';
import defaultConfig from './projectConfig';

let server: VulcanServer;
const folderPath = 'exported-parquets';

beforeAll(() => {
  // create employees table
  MockDuckDBDataSource.runSQL(
    'CREATE TABLE employees(id VARCHAR, name VARCHAR, position VARCHAR)'
  );
  MockDuckDBDataSource.runSQL(
    `INSERT INTO employees VALUES 
    ('436193eb-f686-4105-ad7b-b5945276c14a', 'liz', 'human_resources'),
    ('dc6e5dea-1b88-4a0c-9c17-74d6df676f75', 'freda', 'frontend_engineer'),
    ('fdbd4a1a-9dee-4820-b573-ccb983ca1577', 'andy', 'backend_engineer')`
  );
  // create department table
  MockDuckDBDataSource.runSQL(
    'CREATE TABLE departments(name VARCHAR, employee_id VARCHAR)'
  );
  MockDuckDBDataSource.runSQL(
    `INSERT INTO departments VALUES 
    ('dev_team', 'dc6e5dea-1b88-4a0c-9c17-74d6df676f75'),
    ('dev_team', 'fdbd4a1a-9dee-4820-b573-ccb983ca1577'),
    ('manager_team', '436193eb-f686-4105-ad7b-b5945276c14a')`
  );

  // create store table
  MockDuckDBDataSource.runSQL('CREATE TABLE stores(id VARCHAR, name VARCHAR)');
  MockDuckDBDataSource.runSQL(
    `INSERT INTO stores VALUES 
    ('324ec256-7e5c-4392-8b16-5c13bd3fa64b', '8-11'), 
    ('2db9480f-c369-47d9-b3a4-769f50893afc', 'WcDonald')`
  );

  // create products table
  MockDuckDBDataSource.runSQL(
    'CREATE TABLE products(id VARCHAR, name VARCHAR, store_id VARCHAR)'
  );
  MockDuckDBDataSource.runSQL(
    `INSERT INTO products VALUES 
    ('5a165769-191a-4ae1-a509-07f95adfa896', 'apple', '324ec256-7e5c-4392-8b16-5c13bd3fa64b'),
    ('5bbcfe83-63cc-4a0d-a48a-448790b2a6e9', 'milk', '324ec256-7e5c-4392-8b16-5c13bd3fa64b'),
    ('3716cf08-4016-4530-ab08-b8a6434b4af1', 'french fries', '2db9480f-c369-47d9-b3a4-769f50893afc'),
    ('d4c3acea-4fab-4683-aab7-fdd70d84ce53', 'hamburger', '2db9480f-c369-47d9-b3a4-769f50893afc')`
  );

  // create classes table
  MockDuckDBDataSource.runSQL('CREATE TABLE classes(id VARCHAR, name VARCHAR)');
  MockDuckDBDataSource.runSQL(
    `INSERT INTO classes VALUES 
    ('fa6a4b6e-7944-4b81-86dd-38f67c5700da', 'Computer Science'),
    ('ebb9b1ac-052b-4819-b719-90fb61fa7899', 'Marketing and Management')`
  );
  // create students table
  MockDuckDBDataSource.runSQL(
    'CREATE TABLE students(id VARCHAR, name VARCHAR, class_id VARCHAR)'
  );
  MockDuckDBDataSource.runSQL(
    `INSERT INTO students VALUES 
    ('1c5ccffc-55d5-4d6a-8667-0aecd22ade11', 'eason', 'fa6a4b6e-7944-4b81-86dd-38f67c5700da'), 
    ('131f201f-0db5-4d58-a30b-c73372d7cc19', 'ivan', 'fa6a4b6e-7944-4b81-86dd-38f67c5700da'),
    ('7fa6069d-533e-4c49-a7be-5725be66eb6c', 'coco', 'ebb9b1ac-052b-4819-b719-90fb61fa7899')`
  );
});

afterEach(async () => {
  await server?.close();
});

afterAll(() => {
  fs.rmSync(path.resolve(__dirname, folderPath), { recursive: true });
});

it.each([
  {
    name: 'dev_team',
    expected: [
      {
        name: 'dev_team',
        employee_id: 'dc6e5dea-1b88-4a0c-9c17-74d6df676f75',
      },
      {
        name: 'dev_team',
        employee_id: 'fdbd4a1a-9dee-4820-b573-ccb983ca1577',
      },
    ],
  },
  {
    name: 'manager_team',
    expected: [
      {
        name: 'manager_team',
        employee_id: '436193eb-f686-4105-ad7b-b5945276c14a',
      },
    ],
  },
])(
  'Example 4-1: use cache tag to export duckdb to parquet and load to duckdb cache layer to do the directly query',
  async ({ name, expected }) => {
    // Arrange
    const projectConfig: ServeConfig & IBuildOptions = {
      ...defaultConfig,
      cache: {
        type: CacheLayerStoreFormatType.parquet,
        folderPath: path.resolve(__dirname, folderPath),
        loader: CacheLayerStoreLoaderType.duckdb,
      } as ICacheLayerOptions,
    };
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];
    // Act
    const agent = supertest(httpServer);
    const result = await agent.get(`/api/departments?name=${name}`);
    // Assert
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify(expected));
  },
  1000000
);

it.each([
  {
    id: 'dc6e5dea-1b88-4a0c-9c17-74d6df676f75',
    expected: [
      {
        name: 'dev_team',
        employee_id: 'dc6e5dea-1b88-4a0c-9c17-74d6df676f75',
      },
    ],
  },
  {
    id: '436193eb-f686-4105-ad7b-b5945276c14a',
    expected: [
      {
        name: 'manager_team',
        employee_id: '436193eb-f686-4105-ad7b-b5945276c14a',
      },
    ],
  },
])(
  'Example 4-2: use cache tag with variable to export duckdb to parquet and load to duckdb cache layer to execute cache builder to query',
  async ({ id, expected }) => {
    // Arrange

    const projectConfig: ServeConfig & IBuildOptions = {
      ...defaultConfig,
      cache: {
        type: CacheLayerStoreFormatType.parquet,
        folderPath: path.resolve(__dirname, folderPath),
        loader: CacheLayerStoreLoaderType.duckdb,
      } as ICacheLayerOptions,
    };
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];
    // Act
    const agent = supertest(httpServer);
    const result = await agent.get(`/api/employees/${id}/department`);
    // Assert
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify(expected));
  },
  1000000
);

it.each([
  {
    id: '324ec256-7e5c-4392-8b16-5c13bd3fa64b',
    expected: [
      {
        id: '5a165769-191a-4ae1-a509-07f95adfa896',
        name: 'apple',
        store_id: '324ec256-7e5c-4392-8b16-5c13bd3fa64b',
      },
      {
        id: '5bbcfe83-63cc-4a0d-a48a-448790b2a6e9',
        name: 'milk',
        store_id: '324ec256-7e5c-4392-8b16-5c13bd3fa64b',
      },
    ],
  },
  {
    id: '2db9480f-c369-47d9-b3a4-769f50893afc',
    expected: [
      {
        id: '3716cf08-4016-4530-ab08-b8a6434b4af1',
        name: 'french fries',
        store_id: '2db9480f-c369-47d9-b3a4-769f50893afc',
      },
      {
        id: 'd4c3acea-4fab-4683-aab7-fdd70d84ce53',
        name: 'hamburger',
        store_id: '2db9480f-c369-47d9-b3a4-769f50893afc',
      },
    ],
  },
])(
  'Example 4-3: use cache tag with variable and cache tag without variable to export duckdb to parquet and load to duckdb cache layer to execute cache builder to query',
  async ({ id, expected }) => {
    // Arrange

    const projectConfig: ServeConfig & IBuildOptions = {
      ...defaultConfig,
      cache: {
        type: CacheLayerStoreFormatType.parquet,
        folderPath: path.resolve(__dirname, folderPath),
        loader: CacheLayerStoreLoaderType.duckdb,
      } as ICacheLayerOptions,
    };
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];
    // Act
    const agent = supertest(httpServer);
    const result = await agent.get(`/api/stores/${id}/products`);
    // Assert
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify(expected));
  },
  1000000
);

it.each([
  {
    id: 'fa6a4b6e-7944-4b81-86dd-38f67c5700da',
    expected: [
      {
        id: '1c5ccffc-55d5-4d6a-8667-0aecd22ade11',
        name: 'eason',
      },
      {
        id: '131f201f-0db5-4d58-a30b-c73372d7cc19',
        name: 'ivan',
      },
    ],
  },
  {
    id: 'ebb9b1ac-052b-4819-b719-90fb61fa7899',
    expected: [
      {
        id: '7fa6069d-533e-4c49-a7be-5725be66eb6c',
        name: 'coco',
      },
    ],
  },
])(
  'Example 4-4: use cache tag do sub-query and cache directly query to export duckdb to parquet and load to duckdb cache layer to get result',
  async ({ id, expected }) => {
    // Arrange

    const projectConfig: ServeConfig & IBuildOptions = {
      ...defaultConfig,
      cache: {
        type: CacheLayerStoreFormatType.parquet,
        folderPath: path.resolve(__dirname, folderPath),
        loader: CacheLayerStoreLoaderType.duckdb,
      } as ICacheLayerOptions,
    };
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];
    // Act
    const agent = supertest(httpServer);
    const result = await agent.get(`/api/classes/${id}/students`);
    // Assert
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify(expected));
  },
  1000000
);
