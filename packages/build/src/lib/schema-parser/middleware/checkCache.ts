import { ConfigurationError } from '@vulcan-sql/core';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import { CACHE_METADATA_NAME } from './constants';

export class CheckCache extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    // check .yaml file has cache configuration
    const caches = schemas?.cache;
    if (!caches) return next()

    // throw if cache not used in .sql file 
    const metadata = schemas.metadata;
    if (!(caches && metadata?.[CACHE_METADATA_NAME]?.['isUsedTag'])){
      throw new ConfigurationError('your SQL will use the cache feature, not YAML defined.')  
    } 

    // check if refreshTime and refreshExpression is set at the same time
    caches.forEach(({refreshTime, refreshExpression}): void => {
      if (refreshTime && refreshExpression){
        throw new ConfigurationError('can not configure refreshTime and refreshExpression at the same time, please pick one')
      }
    });
    await next();
  }
}
