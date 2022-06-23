/**
 * The keyName represent to load middleware if it is custom,
/* For the built-in middleware is will load automatically and use default options when not setup keyName and it's options
*/
export interface MiddlewareConfig {
  [keyName: string]: object | string | number | boolean;
}

// The serve package config
export interface ServeConfig {
  /** The middleware config options */
  middlewares?: MiddlewareConfig;
  /** The extension module name */
  extension?: string;
}
