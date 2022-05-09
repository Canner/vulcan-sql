import { NunjucksTagExtension } from './extension';
import * as nunjucks from 'nunjucks';

export class ErrorExtension implements NunjucksTagExtension {
  public name = 'built-in-error';
  public tags = ['error'];
  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes
  ): nunjucks.nodes.Node {
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

    // See above for notes about CallExtension
    return new nodes.CallExtension(this, 'run', errorMessage, []);
  }

  public run(_context: any, message: string, lineno: number, colno: number) {
    throw new Error(`${message} at ${lineno}:${colno}`);
  }
}
