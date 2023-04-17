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
        `{% cache %} tag was used in SQL file, but the cache configurations was not found in Schema ${schemas.urlPath}.`
      );
    }
    if (!isUsedCache && caches) {
      throw new ConfigurationError(
        `Can not configurate the cache setting in Schema ${schemas.urlPath}, {% cache %} tag not been used in SQL file.`
      );
    }

    if (caches) {
      caches.forEach((cache): void => {
        // refreshTime and refreshExpression can not be set at the same time
        const { refreshTime, refreshExpression } = cache;
        if (refreshTime && refreshExpression) {
          throw new ConfigurationError(
            `The cache ${cache.cacheTableName} of Schema ${schemas.urlPath} is invalid: Can not configure refreshTime and refreshExpression at the same time, please pick one`
          );
        }

        // check "every" of "refreshTime" is valid
        let every = refreshTime?.['every'];
        if (every) {
          const { isValid, error } = this.checkRefreshInterval(every);
          if (!isValid) {
            throw new ConfigurationError(
              `The "every" of "refreshTime" in cache ${cache.cacheTableName} of schema ${schemas.urlPath} is invalid: ${error}`
            );
          }
        }
        // check "every" of "refreshExpression" is valid
        every = refreshExpression?.['every'];
        if (every) {
          const { isValid, error } = this.checkRefreshInterval(every);
          if (!isValid) {
            throw new ConfigurationError(
              `The "every" of "refreshExpression" in cache ${cache.cacheTableName} of schema ${schemas.urlPath} is invalid: ${error}`
            );
          }
        }
      });
    }
    await next();
  }

  private checkRefreshInterval(timeInterval: string) {
    let isValid = true;
    let error = null;

    const interval = ms(timeInterval as StringValue);
    if (isNaN(interval)) {
      isValid = false;
      error = 'Invalid time string to convert.';
      return {
        isValid,
        error,
      };
    }
    if (interval < 0) {
      return {
        isValid: false,
        error: 'Time can not be negitive.',
      };
    }
    return { isValid, error };
  }
}
