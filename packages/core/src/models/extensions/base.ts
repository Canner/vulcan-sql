import { TYPES } from '../../containers/types';
import { inject, injectable } from 'inversify';

@injectable()
export abstract class ExtensionBase<C = any> {
  public activate?(): Promise<void>;
  private config?: C;

  constructor(@inject(TYPES.ExtensionConfig) config?: C) {
    this.config = config;
  }

  protected getConfig(): C | undefined {
    return this.config;
  }
}
