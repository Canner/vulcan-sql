import * as nunjucks from 'nunjucks';

export type NunjucksCompilerExtension =
  | NunjucksTagExtension
  | NunjucksFilterExtension;

export interface NunjucksTagExtensionParseResult {
  argsNodeList: nunjucks.nodes.NodeList;
  contentNodes: nunjucks.nodes.Node[];
}

export interface NunjucksTagExtensionRunOptions {
  context: any;
  args: any[];
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

  public async __run(...args: any[]) {
    const context = args[0];
    const callback = args[args.length - 1];
    const otherArgs = args.slice(1, args.length - 1);
    this.extension
      .run({ context, args: otherArgs })
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
