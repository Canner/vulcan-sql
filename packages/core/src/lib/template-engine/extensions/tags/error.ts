import {
  NunjucksTagExtension,
  NunjucksTagExtensionParseResult,
  NunjucksTagExtensionRunOptions,
} from '../extension';
import * as nunjucks from 'nunjucks';

export class ErrorExtension implements NunjucksTagExtension {
  public name = 'built-in-error';
  public tags = ['error'];
  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes
  ): NunjucksTagExtensionParseResult {
    // get the tag token
    const token = parser.nextToken();

    const errorMessage = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    // Add some fake nodes to the AST to indicate error position
    errorMessage.addChild(
      new nodes.Literal(token.lineno, token.colno, token.lineno)
    );
    errorMessage.addChild(
      new nodes.Literal(token.lineno, token.colno, token.colno)
    );

    return {
      argsNodeList: errorMessage,
      contentNodes: [],
    };
  }

  public async run({ args }: NunjucksTagExtensionRunOptions) {
    const message: string = args[0];
    const lineno: number = args[1];
    const colno: number = args[2];
    throw new Error(`${message} at ${lineno}:${colno}`);
  }
}
