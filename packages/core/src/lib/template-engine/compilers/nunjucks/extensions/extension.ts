import * as nunjucks from 'nunjucks';

export type NunjucksCompilerExtension = NunjucksTagExtension;

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
): extension is NunjucksCompilerExtension {
  return extension.tags !== undefined || extension.parse !== undefined;
}
