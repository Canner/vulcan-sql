import { ConfigurationError } from '@vulcan-sql/core';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import { CACHE_METADATA_NAME } from './constants';
import ms, { StringValue } from 'ms';

export class CheckCache extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    // check .yaml file has cache configuration
    const caches = schemas?.cache;
    const metadata = schemas.metadata;
    const isUsedCache = metadata?.[CACHE_METADATA_NAME]?.['isUsedTag'];
    if (!isUsedCache && !caches) return next();

    // throw if cache not used in .sql file
    if (isUsedCache && !caches) {
      throw new ConfigurationError(
        `{% cache %} tag was used in SQL file, but the cache configurations was not found in schema "${schemas.urlPath}".`
      );
    }
    if (!isUsedCache && caches) {
      throw new ConfigurationError(
        `Can not configure the cache setting in schema "${schemas.urlPath}", {% cache %} tag not been used in SQL file.`
      );
    }
    this.checkCacheTableName(schemas);
    this.checkSQLHasValue(schemas);
    this.assignCacheProfile(schemas);
    this.checkRefreshSettings(schemas);
    this.checkIndexesHasValue(schemas);

    await next();
  }

  private checkRefreshSettings(schemas: RawAPISchema) {
    const { cache: caches, urlPath } = schemas;
    for (const cache of caches!) {
      const { refreshTime, refreshExpression, cacheTableName } = cache;
      if (!refreshTime && !refreshExpression) continue;

      if (refreshTime && refreshExpression) {
        throw new ConfigurationError(
          `Can not set "refreshTime" and "refreshExpression" at the same time in cache "${cacheTableName}" of schema "${urlPath}"`
        );
      }
      const options = refreshTime
        ? { type: 'refreshTime', timeInterval: refreshTime!.every }
        : { type: 'refreshExpression', timeInterval: refreshExpression!.every };
      const message = this.checkRefreshInterval(options.timeInterval);
      if (message)
        throw new ConfigurationError(
          `The "${options.type}.every" of cache "${cacheTableName}" in schema "${urlPath}" is invalid: ${message}`
        );
    }
  }

  private checkRefreshInterval(timeInterval?: string) {
    if (!timeInterval) return 'Should have a value.';

    const interval = ms(timeInterval as StringValue);
    if (isNaN(interval)) return 'Invalid time string to convert.';
    if (interval < 0) return 'Time can not be negative.';
    return '';
  }

  private checkCacheTableName(schemas: RawAPISchema) {
    const caches = schemas?.cache;
    const cacheTableNames = [] as string[];
    caches?.forEach((cache) => {
      const { cacheTableName } = cache;

      // should have table name
      if (!cacheTableName) {
        throw new ConfigurationError(
          `The "cacheTableName" of cache in schema "${schemas.urlPath}" is not defined.`
        );
      }
      // table name should be unique
      if (cacheTableNames.includes(cacheTableName)) {
        throw new ConfigurationError(
          `The cacheTableName "${cacheTableName}" of cache in schema "${schemas.urlPath}" is not unique.`
        );
      }
      // table naming pattern
      // 1. start with a letter or underscore, and can only contain letters, numbers, and underscores
      // 2. the sub-characters contain letters, numbers, underscore, and dollar sign
      const pattern = /^[a-zA-Z_][a-zA-Z0-9_$]+$/;
      if (!pattern.test(cacheTableName)) {
        throw new ConfigurationError(
          `The cacheTableName "${cacheTableName}" in schema "${schemas.urlPath}" should meet the pattern "${pattern}".`
        );
      }
      cacheTableNames.push(cacheTableName);
    });
  }

  // check sql is not empty
  private checkSQLHasValue(schemas: RawAPISchema) {
    const { cache: caches, urlPath } = schemas;
    caches?.forEach((cache) => {
      const { sql, cacheTableName } = cache;
      if (!sql) {
        throw new ConfigurationError(
          `The "sql" of cache "${cacheTableName}" in schema "${urlPath}" is not defined or is empty.`
        );
      }
    });
  }
  // check indexes value is not empty
  private checkIndexesHasValue(schemas: RawAPISchema) {
    const { cache: caches, urlPath } = schemas;
    caches?.forEach(({ indexes, cacheTableName }) => {
      if (indexes) {
        Object.entries(indexes).forEach(([indexName, columnName]) => {
          if (!columnName || typeof columnName !== 'string') {
            throw new ConfigurationError(
              `The index "${indexName}" of cache "${cacheTableName}" in schema "${urlPath}" should be a string.`
            );
          }
        });
      }
    });
  }

  // assign the first profile in the schemas.profiles to the cache.profile if cache.profile is not defined
  // cache profile should exist in schemas.profiles
  private assignCacheProfile(schemas: RawAPISchema) {
    const { cache: caches, profiles, urlPath } = schemas;
    if (!profiles) {
      throw new ConfigurationError(
        `The "profiles" of schema "${schemas.urlPath}" is not defined.`
      );
    }
    const defaultProfile = profiles[0];
    for (const cache of caches!) {
      const { profile, cacheTableName } = cache;
      if (!profile) {
        cache.profile = defaultProfile;
        continue;
      }
      // if cache.profile is not in profiles, throw error
      if (!profiles.includes(profile)) {
        throw new ConfigurationError(
          `The profile "${profile}" of cache "${cacheTableName}" in schema "${urlPath}" is not defined in the schema profiles.`
        );
      }
    }
  }
}
