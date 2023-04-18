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
    this.checkRefreshSettings(schemas);
    this.checkCacheTableName(schemas);
    this.checkIndexesHasValue(schemas);
    this.checkSQLHasValue(schemas);
    this.assignCacheProfile(schemas);

    await next();
  }

  private checkRefreshSettings(schemas: RawAPISchema) {
    const caches = schemas?.cache;
    caches?.forEach((cache): void => {
      // refreshTime and refreshExpression can not be set at the same time
      const { refreshTime, refreshExpression } = cache;
      if (refreshTime && refreshExpression) {
        throw new ConfigurationError(
          `Can not set "refreshTime" and "refreshExpression" at the same time in cache "${cache.cacheTableName}" of schema "${schemas.urlPath}"`
        );
      }
      // check "every" of "refreshTime" and "refreshExpression" are valid
      if (refreshTime) {
        this.checkRefreshInterval(
          refreshTime.every,
          cache.cacheTableName,
          schemas.urlPath,
          'refreshTime'
        );
      }
      if (refreshExpression) {
        this.checkRefreshInterval(
          refreshExpression.every,
          cache.cacheTableName,
          schemas.urlPath,
          'refreshExpression'
        );
      }
    });
  }

  private checkRefreshInterval(
    timeInterval: string | undefined,
    cacheTableName: string | undefined,
    schemaPath: string | undefined,
    intervalType: 'refreshTime' | 'refreshExpression'
  ) {
    const interval = ms(timeInterval as StringValue);
    if (isNaN(interval)) {
      throw new ConfigurationError(
        `The "every" of "${intervalType}" in cache "${cacheTableName}" of schema "${schemaPath}" is invalid: Invalid time string to convert.`
      );
    }
    if (interval < 0) {
      throw new ConfigurationError(
        `The "every" of "${intervalType}" in cache "${cacheTableName}" of schema "${schemaPath}" is invalid: Time can not be negative.`
      );
    }
  }

  private checkCacheTableName(schemas: RawAPISchema) {
    const caches = schemas?.cache;
    const cacheTableNameSet = new Set();
    caches?.forEach((cache) => {
      const { cacheTableName } = cache;

      // should have table name
      if (!cacheTableName) {
        throw new ConfigurationError(
          `The cacheTableName of cache in schema "${schemas.urlPath}" is not defined.`
        );
      }
      // table name should be unique
      if (cacheTableNameSet.has(cacheTableName)) {
        throw new ConfigurationError(
          `The cacheTableName "${cacheTableName}" of cache in schema "${schemas.urlPath}" is not unique.`
        );
      }
      // table naming pattern
      // 1. start with a letter or underscore, and can only contain letters, numbers, and underscores
      // 2. the subcharactors contain letters, numbers, underscore, and dollar sign
      const pattern = /^[a-zA-Z_][a-zA-Z0-9_$]+$/;
      if (!pattern.test(cacheTableName)) {
        throw new ConfigurationError(
          `The cacheTableName "${cacheTableName}" in schema "${schemas.urlPath}" should meet the pattern "/^[a-zA-Z_][a-zA-Z0-9_$]+$/".`
        );
      }
      cacheTableNameSet.add(cacheTableName);
    });
  }

  // check sql is not empty
  private checkSQLHasValue(schemas: RawAPISchema) {
    const caches = schemas?.cache;
    caches?.forEach((cache) => {
      const { sql } = cache;
      if (!sql) {
        throw new ConfigurationError(
          `The sql of cache "${cache.cacheTableName}" in schema "${schemas.urlPath}" is not defined or is empty.`
        );
      }
    });
  }
  // check indexes value is not empty
  private checkIndexesHasValue(schemas: RawAPISchema) {
    const caches = schemas?.cache;

    caches?.forEach((cache) => {
      const { indexes } = cache;
      if (indexes) {
        Object.entries(indexes).forEach(([indexName, columnName]) => {
          if (!columnName || typeof columnName !== 'string') {
            throw new ConfigurationError(
              `The index "${indexName}" of cache "${cache.cacheTableName}" in schema "${schemas.urlPath}" should be a string.`
            );
          }
        });
      }
    });
  }

  // assign the first profile in the schemas.profiles to the cache.profile if cache.profile is not defined
  // cache profile should exist in schemas.profiles
  private assignCacheProfile(schemas: RawAPISchema) {
    const caches = schemas?.cache;
    const profiles = schemas?.profiles;
    if (profiles) {
      const defaultProfile = profiles[0];
      caches?.forEach((cache) => {
        if (!cache.profile) {
          cache.profile = defaultProfile;
        } else {
          // if cache.profile is not in profiles, throw error
          const isProfileExist = profiles.some(
            (profile) => profile === cache.profile
          );
          if (!isProfileExist) {
            throw new ConfigurationError(
              `The profile "${cache.profile}" of cache "${cache.cacheTableName}" in schema "${schemas.urlPath}" is not defined in the schema profiles.`
            );
          }
        }
      });
    }
  }
}
