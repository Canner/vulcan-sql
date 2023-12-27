import {
  APISchema,
  ExtensionBase,
  ProjectOptions,
  TYPES as CORE_TYPES,
  VulcanExtension,
} from '@vulcan-sql/api-layer';
import { inject } from 'inversify';
import { TYPES } from '../../containers/types';

@VulcanExtension(TYPES.Extension_SpecGenerator, { enforcedId: true })
export abstract class SpecGenerator<T = any, C = any> extends ExtensionBase<C> {
  abstract getSpec(schemas: APISchema[]): T;

  private projectOption: ProjectOptions;

  constructor(
    @inject(CORE_TYPES.ProjectOptions) projectOption: ProjectOptions,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ExtensionConfig) config: C
  ) {
    super(config, moduleName);
    this.projectOption = projectOption;
  }

  protected getName() {
    return this.projectOption.name || 'API Server';
  }

  protected getDescription() {
    return this.projectOption.description;
  }

  protected getVersion() {
    return this.projectOption.version || '0.0.1';
  }
}
