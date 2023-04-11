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
        "Cache feature was used in SQL file, but didn't find the cache configurations in YAML file."
      );
    }

    if (caches) {
      caches.forEach(({ refreshTime, refreshExpression }): void => {
        // refreshTime and refreshExpression can not be set at the same time
        if (refreshTime && refreshExpression) {
          throw new ConfigurationError(
            'can not configure refreshTime and refreshExpression at the same time, please pick one'
          );
        }
        // the "every" in refreshTime or refreshExpression should be valid
        const timeInterval =
          refreshTime?.['every'] || refreshExpression?.['every'];
        if (timeInterval) {
          let interval: number;
          try {
            interval = ms(timeInterval as StringValue);
          } catch (error) {
            throw new ConfigurationError(
              'invalid refreshTime representation, check node library "ms" for the valid representation'
            );
          }
          if (isNaN(interval)) {
            throw new ConfigurationError(
              'invalid refreshTime representation, check node library "ms" for the valid representation'
            );
          }
          if (interval < 0) {
            throw new ConfigurationError(
              'invalid refreshTime representation, refreshTime can not be negitive'
            );
          }
        }
      });
    }
    await next();
  }
}
