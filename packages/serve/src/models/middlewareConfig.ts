import { LoggerOptions } from '@vulcan/core';
import {
  CorsOptions,
  RateLimitOptions,
  RequestIdOptions,
} from '../lib/middleware';

// built-in options for middleware
export type BuiltInOptions =
  | RequestIdOptions
  | LoggerOptions
  | RateLimitOptions
  | CorsOptions;

export type CustomOptions = string | number | boolean | object;

/**
 * The identifier name represent to load middleware if it is custom,
 * For the built-in middleware is will load automatically and use default options when not setup name and it's options
 */
export interface MiddlewareConfig {
  [name: string]: {
    [param: string]: BuiltInOptions | CustomOptions;
  };
}
