import * as nunjucks from 'nunjucks';

export type NunjucksCompilerExtension =
  | NunjucksTagExtension
  | NunjucksFilterExtension;

export interface NunjucksTagExtension {
  name: string;
  tags: string[];
  parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ): nunjucks.nodes.Node;
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
      return extension.transform({
        value,
        args: args[0] || {},
      });
    },
  };
};

export interface NunjucksFilterExtension<V = any> {
  name: string;
  transform(options: { value: V; args: Record<string, any> }): any;
}

export function isFilterExtension(
  extension: NunjucksCompilerExtension
): extension is NunjucksFilterExtension {
  return (extension as any).transform !== undefined;
}
