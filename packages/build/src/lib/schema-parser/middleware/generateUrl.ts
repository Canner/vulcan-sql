import { RawAPISchema, SchemaParserMiddleware } from './middleware';

export class GenerateUrl extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    if (schemas.urlPath) return next();

    let urlPath = schemas.sourceName.toLocaleLowerCase();

    // replace spaces with dashes
    urlPath = urlPath.replace(/\s/g, '-');

    // add leading slash
    if (urlPath.charAt(0) !== '/') urlPath = `/${urlPath}`;

    // remove trailing slash
    if (urlPath.charAt(urlPath.length - 1) === '/')
      urlPath = urlPath.slice(0, -1);

    schemas.urlPath = urlPath;

    return next();
  }
}
