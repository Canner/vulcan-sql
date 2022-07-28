export * from './corsMiddleware';
export * from './requestIdMiddleware';
export * from './auditLogMiddleware';
export * from './rateLimitMiddleware';
export * from './response-format';

import { CorsMiddleware } from './corsMiddleware';
import { RateLimitMiddleware } from './rateLimitMiddleware';
import { RequestIdMiddleware } from './requestIdMiddleware';
import { AuditLoggingMiddleware } from './auditLogMiddleware';
import { ResponseFormatMiddleware } from './response-format';

// The order is the middleware running order
export const BuiltInRouteMiddlewares = [
  CorsMiddleware,
  RateLimitMiddleware,
  RequestIdMiddleware,
  AuditLoggingMiddleware,
  ResponseFormatMiddleware,
];
