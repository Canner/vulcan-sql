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
    '{% cache %} tag was used in SQL file, but the cache configurations was not found in schema "/urlPath".'
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
    'Can not configure the cache setting in schema "/urlPath", {% cache %} tag not been used in SQL file.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when both refreshTime and refreshExpression are defined.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
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
    'Can not set "refreshTime" and "refreshExpression" at the same time in cache "cache_table_name" of schema "/urlPath"'
  );
  expect(next).not.toHaveBeenCalled();
});

// refreshTime expression test cases
it('Should throw an error when the value of "every" of "refreshTime" is a invalid string that can not be convert.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
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
    'The "every" of "refreshTime" in cache "cache_table_name" of schema "/urlPath" is invalid: Invalid time string to convert.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when a converted value of "every" of "refreshTime" is negative.', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
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
    'The "every" of "refreshTime" in cache "cache_table_name" of schema "/urlPath" is invalid: Time can not be negative.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should call next function when schemas have cache with valid refreshTime representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    profiles: ['profile1'],
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
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: {
          expression: 'MAX(create_at)',
          every: 'invalidString',
        },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshExpression" in cache "cache_table_name" of schema "/urlPath" is invalid: Invalid time string to convert.'
  );
  expect(next).not.toHaveBeenCalled();
});
it('Should throw an error when a negative refreshExpression interval is used', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { expression: 'MAX(create_at)', every: '-5m' },
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "every" of "refreshExpression" in cache "cache_table_name" of schema "/urlPath" is invalid: Time can not be negative.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should call next function when schemas have cache with valid refreshExpression representation', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        refreshExpression: { expression: 'MAX(create_at)', every: '5m' },
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});

// checkCacheTableName
it('Should throw an error when cacheTableName is not defined', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        sql: 'SELECT * FROM test_table',
      },
    ],
  } as any;
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "cacheTableName" of cache in schema "/urlPath" is not defined.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when cacheTableName is not unique', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'duplicate_cache_table_name',
        sql: 'SELECT * FROM test_table_1',
      },
      {
        cacheTableName: 'duplicate_cache_table_name',
        sql: 'SELECT * FROM test_table_2',
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The cacheTableName "duplicate_cache_table_name" of cache in schema "/urlPath" is not unique.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should throw an error when cacheTableName does not match the regex', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: '!cache_table_name',
        sql: 'SELECT * FROM test_table',
      },
    ],
  };
  const invalidCacheTableNames = [
    '1start_with_digit',
    '!start_with_special_char',
    '/start_with_special_char',
    '*start_with_special_char',
    'table name with space',
    'table_name_with_special_char_!',
    'table_name_with_special_char_/',
  ];
  for (const cacheTableName of invalidCacheTableNames) {
    schemas['cache']![0]['cacheTableName'] = cacheTableName;
    await expect(middleware.handle(schemas, next)).rejects.toThrow(
      `The cacheTableName "${cacheTableName}" in schema "/urlPath" should meet the pattern "/^[a-zA-Z_][a-zA-Z0-9_$]+$/`
    );
    expect(next).not.toHaveBeenCalled();
  }
});
// should pass test if cacheTableName is valid and meet the regex
it('Should call next function when schemas have cache with valid cacheTableName', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
      },
    ],
  };
  const longString = Array(1000).fill('a').join('');
  // pattern: /^[a-zA-Z_][a-zA-Z0-9_$]+$/
  const validCacheTableNames = [
    'start_with_lower_case_letter',
    '_start_with_underscore',
    'Start_with_lower_case_letter',
    'does_not_contain_special_char',
    'contain_digit_1234567890',
    'contain_upper_case_LETTER',
    longString,
  ];

  for (const cacheTableName of validCacheTableNames) {
    schemas['cache']![0]['cacheTableName'] = cacheTableName;
    await middleware.handle(schemas, next);
    expect(next).toHaveBeenCalled();
  }
});
// checkSql
it('Should throw an error when sql is not defined', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
      },
    ],
  } as any;
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "sql" of cache "cache_table_name" in schema "/urlPath" is not defined or is empty.'
  );
  expect(next).not.toHaveBeenCalled();
});
// check indexes value is not empty
it('Should throw an error when indexes is empty', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    profiles: ['profile1'],
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        indexes: { idx_invalid_column_value: 123 },
      },
    ],
  } as any;
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The index "idx_invalid_column_value" of cache "cache_table_name" in schema "/urlPath" should be a string.'
  );
  expect(next).not.toHaveBeenCalled();
});

// assign profile
// should throw error if not profiles in schemas
it('Should throw an error when there is no profile in schemas', async () => {
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
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The "profiles" of schema "/urlPath" is not defined.'
  );
  expect(next).not.toHaveBeenCalled();
});

it('Should assign the first profile in the schemas.profiles to the cache.profile if cache.profile is not defined', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    profiles: ['first_profile', 'second_profile'],
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(schemas.cache![0].profile).toEqual(schemas.profiles![0]);
  expect(next).toHaveBeenCalled();
});

it('Should assign the cache.profile to the cache.profile if cache.profile is defined', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    profiles: ['first_profile', 'second_profile'],
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        profile: 'second_profile',
      },
    ],
  };
  await middleware.handle(schemas, next);
  expect(schemas.cache![0].profile).toEqual(schemas.profiles![1]);
  expect(next).toHaveBeenCalled();
});

it('Should throw an error when cache.profile is not in the schemas.profiles', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    urlPath: '/urlPath',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    profiles: ['first_profile', 'second_profile'],
    cache: [
      {
        cacheTableName: 'cache_table_name',
        sql: 'SELECT * FROM test_table',
        profile: 'third_profile',
      },
    ],
  };
  await expect(middleware.handle(schemas, next)).rejects.toThrow(
    'The profile "third_profile" of cache "cache_table_name" in schema "/urlPath" is not defined in the schema profiles.'
  );
  expect(next).not.toHaveBeenCalled();
});

// should pass when all configurations are valid
it('Should call next function when schemas have cache with valid configurations', async () => {
  const schemas: RawAPISchema = {
    sourceName: 'test',
    metadata: {
      'cache.vulcan.com': {
        isUsedTag: true,
      },
    },
    profiles: ['first_profile', 'second_profile'],
    cache: [
      {
        cacheTableName: 'first_unique_table_name',
        sql: 'SELECT * FROM test_table',
        profile: 'second_profile',
        refreshExpression: {
          expression: 'MAX(updated_at)',
          every: '5m',
        },
      },
      {
        cacheTableName: 'second_unique_table_name',
        sql: 'SELECT * FROM test_table',
        profile: null,
        refreshTime: {
          every: '1d',
        },
      },
    ],
  } as any;
  await middleware.handle(schemas, next);
  expect(next).toHaveBeenCalled();
});
