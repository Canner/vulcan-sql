import { LoggerOptions } from '@vulcan-sql/core';
import {
  CorsOptions,
  RateLimitOptions,
  RequestIdOptions,
  ResponseFormatOptions,
} from '../lib/middleware';

// built-in options for middleware
export type BuiltInOptions =
  | RequestIdOptions
  | LoggerOptions
  | RateLimitOptions
  | CorsOptions
  | ResponseFormatOptions;

export type CustomOptions = any;

/**
 * The identifier name represent to load middleware if it is custom,
 * For the built-in middleware is will load automatically and use default options when not setup name and it's options
 */
export interface MiddlewareConfig {
  [name: string]: {
    [param: string]: BuiltInOptions | CustomOptions;
  };
}
