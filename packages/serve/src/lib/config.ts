/**
 * The keyName represent to load middleware if it is custom,
/* For the built-in middleware is will load automatically and use default options when not setup keyName and it's options
*/

import { LoggerOptions } from '@vulcan/core';
import { CorsOptions, RateLimitOptions, RequestIdOptions } from './middleware';

// built-in options for middleware
export type BuiltInOptions =
  | RequestIdOptions
  | LoggerOptions
  | RateLimitOptions
  | CorsOptions;

export type CustomOptions = string | number | boolean | object;

export interface MiddlewareConfig {
  [keyName: string]: {
    [param: string]: BuiltInOptions | CustomOptions;
  };
}

// The serve package config
export interface ServeConfig {
  /** The middleware config options */
  middlewares?: MiddlewareConfig;
  /** The extension module name */
  extension?: string;
}
