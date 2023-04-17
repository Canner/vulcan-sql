import { RawAPISchema } from '@vulcan-sql/build';
import { CheckCache } from '@vulcan-sql/build/schema-parser/middleware/checkCache';

let middleware: CheckCache;
const next = jest.fn();

beforeEach(() => {
  middleware = new CheckCache();
  next.mockClear();
});
it('Should call next() when there are no caches or cache metadata', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {},
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});

it('Should throw an error when caches is used but not been defined in schema.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    '{% cache %} tag was used in SQL file, but the cache configurations was not found in Schema /urlPath.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when caches is not used but been defined in schema.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: false,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'Can not configurate the cache setting in Schema /urlPath, {% cache %} tag not been used in SQL file.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when both refreshTime and refreshExpression are defined.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '5m' },
        refreshExpression: { expression: 'MAX(create_time)', every: '5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The cache cache_table_name of Schema /urlPath is invalid: Can not configure refreshTime and refreshExpression at the same time, please pick one'
  );
  expect(next).not.toHaveBeenCalled();
});

// refreshTime expression test cases
it('Should throw an error when the value of "every" of "refreshTime" is a invalid string that can not be convert.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: 'invalidTimeString' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshTime" in cache cache_table_name of schema /urlPath is invalid: Invalid time string to convert.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when a converted value of "every" of "refreshTime" is negative.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '-5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshTime" in cache cache_table_name of schema /urlPath is invalid: Time can not be negitive.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should call next function when schemas have cache with valid refreshTime representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '5m' },
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});

// refreshExpression time expression test cases
it('Should throw an error when the value of "every" of "refreshExpression" is a invalid string that can not be convert.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: 'invalidString' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshExpression" in cache cache_table_name of schema /urlPath is invalid: Invalid time string to convert.'
  );
  expect(next).not.toHaveBeenCalled();
});
it('Should throw an error when a negative refreshExpression interval is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: '-5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshExpression" in cache cache_table_name of schema /urlPath is invalid: Time can not be negitive.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should call next function when schemas have cache with valid refreshExpression representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: '5m' },
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});
