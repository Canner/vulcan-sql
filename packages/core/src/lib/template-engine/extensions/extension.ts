import * as nunjucks from 'nunjucks';

export type NunjucksCompilerExtension =
  | NunjucksTagExtension
  | NunjucksFilterExtension;

export interface NunjucksTagExtensionParseResult {
  /** The arguments if this extension, they'll be render to string and passed to run function */
  argsNodeList: nunjucks.nodes.NodeList;
  /** The content (usually the body) of this extension, they'll be passed to run function as render functions */
  contentNodes: nunjucks.nodes.Node[];
}

export type TagExtensionContentArgGetter = () => Promise<string>;

export type TagExtensionArgTypes = string | number | boolean;

export interface NunjucksTagExtensionRunOptions {
  context: any;
  args: TagExtensionArgTypes[];
  contentArgs: TagExtensionContentArgGetter[];
}

class WrapperTagExtension {
  // Nunjucks use this value as the name of this extension
  public __name: string;
  public tags: string[];

  constructor(private extension: NunjucksTagExtension) {
    this.__name = extension.name;
    this.tags = extension.tags;
  }

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    const { argsNodeList, contentNodes } = this.extension.parse(
      parser,
      nodes,
      lexer
    );
    return new nodes.CallExtensionAsync(
      this,
      '__run',
      argsNodeList,
      contentNodes
    );
  }

  public __run(...originalArgs: any[]) {
    const context = originalArgs[0];
    // Nunjucks use the pass the callback function for async extension at the last argument
    // https://github.com/mozilla/nunjucks/blob/master/nunjucks/src/compiler.js#L256
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

    this.extension
      .run({ context, args, contentArgs })
      .then((result) => callback(null, result))
      .catch((err) => callback(err, null));
  }
}

export const NunjucksTagExtensionWrapper = (
  extension: NunjucksTagExtension
) => ({
  name: extension.name,
  transform: new WrapperTagExtension(extension),
});

export interface NunjucksTagExtension {
  name: string;
  tags: string[];
  parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ): NunjucksTagExtensionParseResult;
  run(options: NunjucksTagExtensionRunOptions): Promise<string | void>;
}

export function isTagExtension(
  extension: NunjucksCompilerExtension
): extension is NunjucksTagExtension {
  return (
    (extension as any).tags !== undefined &&
    (extension as any).parse !== undefined
  );
}

export const NunjucksFilterExtensionWrapper = (
  extension: NunjucksFilterExtension
) => {
  return {
    name: extension.name,
    transform: (value: any, ...args: any[]) => {
      // Nunjucks use the pass the callback function for async filter at the last argument
      // https://github.com/mozilla/nunjucks/blob/master/nunjucks/src/compiler.js#L514
      const callback = args[args.length - 1];
      const otherArgs = args.slice(0, args.length - 1);
      extension
        .transform({
          value,
          args: otherArgs,
        })
        .then((res) => callback(null, res))
        .catch((err) => callback(err, null));
    },
  };
};

export interface NunjucksFilterExtension<V = any> {
  name: string;
  transform(options: { value: V; args: Record<string, any> }): Promise<any>;
}

export function isFilterExtension(
  extension: NunjucksCompilerExtension
): extension is NunjucksFilterExtension {
  return (extension as any).transform !== undefined;
}
