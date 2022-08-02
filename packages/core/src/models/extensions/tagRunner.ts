import { TYPES } from '@vulcan-sql/core/types';
import { sortBy } from 'lodash';
import * as nunjucks from 'nunjucks';
import { VulcanExtension } from './decorators';
import { RuntimeExtension } from './templateEngine';

export type TagExtensionContentArgGetter = () => Promise<string>;

export type TagExtensionArgTypes = string | number | boolean;

export interface TagRunnerOptions {
  context: any;
  args: TagExtensionArgTypes[];
  contentArgs: TagExtensionContentArgGetter[];
}

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class TagRunner<C = any> extends RuntimeExtension<C> {
  abstract tags: string[];
  abstract run(
    options: TagRunnerOptions
  ): Promise<string | nunjucks.runtime.SafeString | void>;

  public __run(...originalArgs: any[]) {
    const context = originalArgs[0];
    const callback = originalArgs[originalArgs.length - 1];
    const args = originalArgs
      .slice(1, originalArgs.length - 1)
      .filter((value) => typeof value !== 'function');
    const contentArgs = originalArgs
      .slice(1, originalArgs.length - 1)
      .filter((value) => typeof value === 'function')
      .map((cb) => () => {
        return new Promise<string>((resolve, reject) => {
          cb((err: any, result: any) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      });

    this.run({ context, args, contentArgs })
      .then((result) => callback(null, result))
      .catch((err) => callback(err, null));
  }

  public set __name(_) {
    // ignore it
  }

  public get __name() {
    return this.getName();
  }

  public getName() {
    return sortBy(this.tags).join('_');
  }
}
