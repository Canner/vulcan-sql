import { sortBy } from 'lodash';
import * as nunjucks from 'nunjucks';
import { injectable } from 'inversify';

export type TagExtensionContentArgGetter = () => Promise<string>;

export type TagExtensionArgTypes = string | number | boolean;

export interface TagRunnerOptions {
  context: any;
  args: TagExtensionArgTypes[];
  contentArgs: TagExtensionContentArgGetter[];
}

export type Extension = RuntimeExtension | CompileTimeExtension;

@injectable()
export abstract class RuntimeExtension {}

@injectable()
export abstract class CompileTimeExtension {}

export abstract class TagBuilder extends CompileTimeExtension {
  abstract tags: string[];
  abstract parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ): nunjucks.nodes.Node;

  public set __name(_) {
    // ignore it
  }

  public get __name() {
    return this.getName();
  }

  public getName() {
    return sortBy(this.tags).join('_');
  }

  protected createAsyncExtensionNode(
    /** The arguments if this extension, they'll be render to string and passed to run function */
    argsNodeList: nunjucks.nodes.NodeList,
    /** The content (usually the body) of this extension, they'll be passed to run function as render functions */
    contentNodes: nunjucks.nodes.Node[] = []
  ) {
    return new nunjucks.nodes.CallExtensionAsync(
      this.getName(),
      '__run',
      argsNodeList,
      contentNodes
    );
  }
}

export abstract class TagRunner extends RuntimeExtension {
  abstract tags: string[];
  abstract run(options: TagRunnerOptions): Promise<string | void>;

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

export abstract class FilterBuilder extends CompileTimeExtension {
  abstract filterName: string;
}

export abstract class FilterRunner<V = any> extends RuntimeExtension {
  abstract filterName: string;
  abstract transform(options: {
    value: V;
    args: Record<string, any>;
  }): Promise<any>;

  public __transform(value: any, ...args: any[]) {
    const callback = args[args.length - 1];
    const otherArgs = args.slice(0, args.length - 1);
    this.transform({
      value,
      args: otherArgs,
    })
      .then((res) => callback(null, res))
      .catch((err) => callback(err, null));
  }
}

export const implementedOnAstVisit = (source: any): source is OnAstVisit => {
  return !!source.onVisit;
};

export interface OnAstVisit {
  onVisit(node: nunjucks.nodes.Node): void;
  finish?: () => void;
}

export const implementedProvideMetadata = (
  source: any
): source is ProvideMetadata => {
  return !!source.metadataName && !!source.getMetadata;
};

export interface ProvideMetadata {
  metadataName: string;
  getMetadata(): any;
}
