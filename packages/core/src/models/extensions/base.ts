import { TYPES } from '../../containers/types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import {
  EXTENSION_IDENTIFIER_METADATA_KEY,
  EXTENSION_TYPE_METADATA_KEY,
} from './decorators';
import { getLogger } from '../../lib/utils';

@injectable()
export abstract class ExtensionBase<C = any> {
  public readonly moduleName: string;
  public onActivate?(): Promise<void>;
  private config?: C;
  private activated = false;

  public async activate() {
    if (this.activated) return;
    await this.onActivate?.();
    this.activated = true;
  }

  constructor(
    @inject(TYPES.ExtensionConfig) config: C,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    this.config = config;
    this.moduleName = moduleName;
  }

  public getExtensionId(): string | undefined {
    return Reflect.getMetadata(
      EXTENSION_IDENTIFIER_METADATA_KEY,
      this.constructor
    );
  }

  public getExtensionType(): symbol {
    return Reflect.getMetadata(EXTENSION_TYPE_METADATA_KEY, this.constructor);
  }

  protected getConfig(): C | undefined {
    return this.config;
  }

  protected getLogger() {
    const prefix: string[] = [this.getExtensionType().description || ''];
    const extId = this.getExtensionId();
    if (extId) prefix.push(extId);
    return getLogger({
      scopeName: 'CORE',
      options: {
        prefix,
      },
    });
  }
}
