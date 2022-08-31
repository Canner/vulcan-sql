export * from './corsMiddleware';
export * from './requestIdMiddleware';
export * from './auditLogMiddleware';
export * from './rateLimitMiddleware';
export * from './authMiddleware';
export * from './response-format';
export * from './enforceHttpsMiddleware';

import { CorsMiddleware } from './corsMiddleware';
import { AuthMiddleware } from './authMiddleware';
import { RateLimitMiddleware } from './rateLimitMiddleware';
import { RequestIdMiddleware } from './requestIdMiddleware';
import { AuditLoggingMiddleware } from './auditLogMiddleware';
import { ResponseFormatMiddleware } from './response-format';
import { EnforceHttpsMiddleware } from './enforceHttpsMiddleware';
import { ClassType, ExtensionBase } from '@vulcan-sql/core';

// The order is the middleware running order
export const BuiltInRouteMiddlewares: ClassType<ExtensionBase>[] = [
  CorsMiddleware,
  EnforceHttpsMiddleware,
  RequestIdMiddleware,
  AuditLoggingMiddleware,
  RateLimitMiddleware,
  AuthMiddleware,
  ResponseFormatMiddleware,
];
