export * from './corsMiddleware';
export * from './requestIdMiddleware';
export * from './accessLogMiddleware';
export * from './rateLimitMiddleware';
export * from './authMiddleware';
export * from './response-format';
export * from './enforceHttpsMiddleware';
export * from './docRouterMiddleware';

import { CorsMiddleware } from './corsMiddleware';
import { AuthMiddleware } from './authMiddleware';
import { RateLimitMiddleware } from './rateLimitMiddleware';
import { RequestIdMiddleware } from './requestIdMiddleware';
import { AccessLogMiddleware } from './accessLogMiddleware';
import { ResponseFormatMiddleware } from './response-format';
import { EnforceHttpsMiddleware } from './enforceHttpsMiddleware';
import { ClassType, ExtensionBase } from '@vulcan-sql/core';
import { DocRouterMiddleware } from './docRouterMiddleware';

// The order is the middleware running order
export const BuiltInRouteMiddlewares: ClassType<ExtensionBase>[] = [
  CorsMiddleware,
  EnforceHttpsMiddleware,
  RequestIdMiddleware,
  AccessLogMiddleware,
  RateLimitMiddleware,
  AuthMiddleware,
  ResponseFormatMiddleware,
  DocRouterMiddleware,
];
