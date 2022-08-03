import { TYPES } from '../../containers/types';
import { inject, injectable } from 'inversify';

@injectable()
export abstract class ExtensionBase<C = any> {
  public readonly moduleName: string;
  public activate?(): Promise<void>;
  private config?: C;

  constructor(
    @inject(TYPES.ExtensionConfig) config: C,
    @inject(TYPES.ExtensionName) name: string
  ) {
    this.config = config;
    this.moduleName = name;
  }

  protected getConfig(): C | undefined {
    return this.config;
  }
}
