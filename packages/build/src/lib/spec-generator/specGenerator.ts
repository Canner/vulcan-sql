import { APISchema } from '@vulcan/core';
import { IBuildOptions } from '../../models/buildOptions';

export abstract class SpecGenerator<T> {
  private schemas: APISchema[];
  private config: IBuildOptions;

  constructor(schemas: APISchema[], config: IBuildOptions) {
    this.schemas = schemas;
    this.config = config;
  }

  abstract getSpec(): T;

  protected getName() {
    return this.config.name || 'API Server';
  }

  protected getDescription() {
    return this.config.description;
  }

  protected getVersion() {
    return this.config.version || '0.0.1';
  }

  protected getSchemas() {
    return this.schemas;
  }
}
