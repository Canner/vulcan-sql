import { asyncReqIdStorage } from './logger';
import * as nunjucks from 'nunjucks';

export interface VulcanErrorOptions {
  code?: string;
  nestedError?: Error;
  httpCode?: number;
  exitCode?: number;
  description?: string;
}

export interface TemplateErrorOptions extends VulcanErrorOptions {
  node?: nunjucks.nodes.Node;
}

export class VulcanError extends Error {
  public readonly code?: string;
  public readonly nestedError?: Error;
  public readonly httpCode?: number;
  public readonly exitCode?: number;
  public readonly description?: string;
  public readonly requestId?: string;

  constructor(message?: string, options?: VulcanErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.code = options?.code;
    this.nestedError = options?.nestedError;
    this.httpCode = options?.httpCode;
    this.exitCode = options?.exitCode;
    this.description = options?.description;
    this.requestId = asyncReqIdStorage.getStore()?.requestId;
  }
}

/** Expected errors, which is caused by users */
export class UserError extends VulcanError {
  constructor(message?: string, options?: VulcanErrorOptions) {
    super(message, {
      ...options,
      httpCode: options?.httpCode || 400,
      code: options?.code || 'vulcan.userError',
      exitCode: options?.exitCode || 2,
    });
  }
}

/** Unexpected errors, which is caused by internal issues */
export class InternalError extends VulcanError {
  constructor(message?: string, options?: VulcanErrorOptions) {
    super(message, {
      ...options,
      httpCode: options?.httpCode || 500,
      code: options?.code || 'vulcan.internalError',
      exitCode: options?.exitCode || 3,
    });
  }
}

/** The configurations e.g. vulcan.yaml, user.yaml ... are incorrect */
export class ConfigurationError extends InternalError {
  constructor(message?: string, options?: VulcanErrorOptions) {
    super(message, {
      ...options,
      code: options?.code || 'vulcan.configError',
    });
  }
}

/** Error from template syntax */
export class TemplateError extends InternalError {
  constructor(message?: string, options?: TemplateErrorOptions) {
    super(message, {
      ...options,
      code: options?.code || 'vulcan.templateError',
    });
  }
}
