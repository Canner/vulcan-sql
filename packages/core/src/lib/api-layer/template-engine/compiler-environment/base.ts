import { ExtensionBase } from '@vulcan-sql/core/models';
import * as nunjucks from 'nunjucks';

/**
 * This case can't be inject into container directly because of the extending of nunjucks.Environment
 */
export abstract class BaseCompilerEnvironment extends nunjucks.Environment {
  abstract getExtensions(): ExtensionBase[];

  // initialize template engines extensions
  public async initializeExtensions() {
    const extensions = this.getExtensions();
    for (const extension of extensions) {
      await extension.activate();
    }
  }
}
