export * from './corsMiddleware';
export * from './requestIdMiddleware';
export * from './accessLogMiddleware';
export * from './rateLimitMiddleware';
export * from './auth';
export * from './response-format';
export * from './enforceHttpsMiddleware';
export * from './docRouterMiddleware';
export * from './errorHandlerMIddleware';
export * from './activityLogMiddleware';

import { CorsMiddleware } from './corsMiddleware';
import {
  AuthRouterMiddleware,
  AuthCredentialsMiddleware,
  AuthSourceNormalizerMiddleware,
} from './auth';
import { RateLimitMiddleware } from './rateLimitMiddleware';
import { RequestIdMiddleware } from './requestIdMiddleware';
import { AccessLogMiddleware } from './accessLogMiddleware';
import { ResponseFormatMiddleware } from './response-format';
import { EnforceHttpsMiddleware } from './enforceHttpsMiddleware';
import { ClassType, ExtensionBase } from '@vulcan-sql/core';
import { DocRouterMiddleware } from './docRouterMiddleware';
import { ErrorHandlerMiddleware } from './errorHandlerMIddleware';
import { CatalogRouterMiddleware } from './catalogRouterMiddleware';
import { ActivityLogMiddleware } from './activityLogMiddleware';

// The array is the middleware running order
export const BuiltInRouteMiddlewares: ClassType<ExtensionBase>[] = [
  RequestIdMiddleware,
  ActivityLogMiddleware,
  ErrorHandlerMiddleware,
  AccessLogMiddleware,
  CorsMiddleware,
  EnforceHttpsMiddleware,
  RateLimitMiddleware,
  AuthSourceNormalizerMiddleware,
  AuthCredentialsMiddleware,
  AuthRouterMiddleware,
  ResponseFormatMiddleware,
  DocRouterMiddleware,
  CatalogRouterMiddleware,
];
