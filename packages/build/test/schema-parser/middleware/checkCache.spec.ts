import { RawAPISchema } from '@vulcan-sql/build';
import { CheckCache } from '@vulcan-sql/build/schema-parser/middleware/checkCache';

let middleware: CheckCache;
const next = jest.fn();

beforeEach(() => {
  middleware = new CheckCache();
  next.mockClear();
});
it('should call next() when there are no caches or cache metadata', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {},
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});

it('should throw an error when caches is used but not been defined in schema.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    "Cache feature was used in SQL file, but didn't find the cache configurations in YAML file."
  );
  expect(next).not.toHaveBeenCalled();
});

it('should throw an error when both refreshTime and refreshExpression are defined.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '5m' },
        refreshExpression: { expression: '*/5,*,*,*,*', every: '5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'can not configure refreshTime and refreshExpression at the same time, please pick one'
  );
  expect(next).not.toHaveBeenCalled();
});

// refreshTime expression test cases
it('should throw an error when an invalid refreshTime representation is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: 'invalidString' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'invalid refreshTime representation, check node library "ms" for the valid representation'
  );
  expect(next).not.toHaveBeenCalled();
});

it('should throw an error when a negative refreshTime interval is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '-5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'invalid refreshTime representation, refreshTime can not be negitive'
  );
  expect(next).not.toHaveBeenCalled();
});

it('should call next function when schemas have cache with valid refreshTime representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshTime: { every: '5m' },
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});

// refreshExpression time expression test cases
it('should throw an error when an invalid refreshExpression representation is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: 'invalidString' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'invalid refreshTime representation, check node library "ms" for the valid representation'
  );
  expect(next).not.toHaveBeenCalled();
});
it('should throw an error when a negative refreshExpression interval is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: '-5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'invalid refreshTime representation, refreshTime can not be negitive'
  );
  expect(next).not.toHaveBeenCalled();
});

it('should call next function when schemas have cache with valid refreshExpression representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'test_cache',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { every: '5m' },
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});
