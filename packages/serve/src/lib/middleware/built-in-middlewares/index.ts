export * from './corsMiddleware';
export * from './requestIdMiddleware';
export * from './auditLogMiddleware';

import { CorsMiddleware } from './corsMiddleware';
import { RequestIdMiddleware } from './requestIdMiddleware';
import { AuditLoggingMiddleware } from './auditLogMiddleware';

export default [CorsMiddleware, RequestIdMiddleware, AuditLoggingMiddleware];
