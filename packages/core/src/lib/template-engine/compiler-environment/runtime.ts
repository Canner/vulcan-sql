import {
  CodeLoader,
  ExtensionBase,
  FilterRunner,
  RuntimeExtension,
  TagRunner,
  TemplateEngineExtension,
} from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { inject, multiInject, optional } from 'inversify';
import { BaseCompilerEnvironment } from './base';

/**
 * Runtime environment is used when we executing templates.
 */
export class RuntimeCompilerEnvironment extends BaseCompilerEnvironment {
  private extensions: RuntimeExtension[] = [];

  constructor(
    @inject(TYPES.CompilerLoader)
    compilerLoader: CodeLoader,
    @multiInject(TYPES.Extension_TemplateEngine)
    @optional()
    extensions: TemplateEngineExtension[] = []
  ) {
    super(compilerLoader);
    // We only need runtime extensions like filterRunner, tagRunner ...etc.
    this.extensions = extensions.filter(
      (extension) => extension instanceof RuntimeExtension
    );
    this.loadExtensions();
  }

  public getExtensions(): ExtensionBase<any>[] {
    return this.extensions;
  }

  private loadExtensions(): void {
    this.extensions.forEach(this.loadExtension.bind(this));
  }

  private loadExtension(extension: RuntimeExtension) {
    if (extension instanceof TagRunner) {
      this.addExtension(extension.getName(), extension);
    } else if (extension instanceof FilterRunner) {
      this.addFilter(
        extension.filterName,
        function (this: any, value: any, ...args) {
          // use classic function to receive context
          extension.__transform(this, value, ...args);
        },
        true
      );
    }
  }
}
