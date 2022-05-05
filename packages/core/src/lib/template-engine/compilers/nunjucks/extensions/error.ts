import { NunjucksTagExtension } from './extension';

export class ErrorExtension implements NunjucksTagExtension {
  public name = 'built-in-error';
  public tags = ['error'];
  public parse(parser: any, nodes: any, lexer: any) {
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

  public run(_: any, message: string, lineno: number, colno: number) {
    throw new Error(`${message} at ${lineno}:${colno}`);
  }
}
