import * as nunjucks from 'nunjucks';
import { TagBuilder, VulcanInternalExtension } from '@vulcan-sql/api-layer/models';
import { SANITIZER_NAME } from '../query-builder/constants';

@VulcanInternalExtension()
export class MaskingTagBuilder extends TagBuilder {
  public tags = ['masking'];

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    // {% masking <column-name> <masking-function> %}
    const token = parser.nextToken();
    const columnName = parser.nextToken();
    const functionName = parser.nextToken();
    if (functionName.type === lexer.TOKEN_BLOCK_END) {
      parser.fail(
        `Expected a symbol, but got a block end`,
        functionName.lineno,
        functionName.colno
      );
    }

    const argsNodeToPass = new nodes.NodeList(token.lineno, token.colno);
    argsNodeToPass.addChild(
      new nodes.Literal(columnName.lineno, columnName.colno, columnName.value)
    );
    switch (functionName.value) {
      case 'partial': {
        return this.parsePartial(parser, nodes, lexer, argsNodeToPass);
      }

      default:
        parser.fail(
          `Unknown function: ${functionName.value}`,
          functionName.lineno,
          functionName.colno
        );
    }
  }

  private parsePartial(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer,
    argsNodeToPass: nunjucks.nodes.NodeList
  ) {
    const leftParen = parser.nextToken();
    if (leftParen.type !== lexer.TOKEN_LEFT_PAREN) {
      parser.fail(
        `Expected a function start`,
        leftParen.lineno,
        leftParen.colno
      );
    }

    const prefix = parser.parseExpression();
    const commaOne = parser.nextToken();
    if (commaOne.type !== lexer.TOKEN_COMMA) {
      parser.fail(
        `Expected a function has 3 arguments, but got 1`,
        commaOne.lineno,
        commaOne.colno
      );
    }

    const padding = parser.parseExpression();
    const commaTwo = parser.nextToken();
    const commaCount = [commaOne, commaTwo].filter(
      (token) => token.type === lexer.TOKEN_COMMA
    ).length;
    if (commaCount !== 2) {
      parser.fail(
        `Expected a function has 3 arguments, but got ${commaCount + 1}`,
        commaTwo.lineno,
        commaTwo.colno
      );
    }

    const suffix = parser.parseExpression();
    const rightParen = parser.nextToken();
    if (rightParen.type !== lexer.TOKEN_RIGHT_PAREN) {
      parser.fail(
        `Expected a function end`,
        rightParen.lineno,
        rightParen.colno
      );
    }

    parser.advanceAfterBlockEnd(rightParen.value);

    argsNodeToPass.addChild(this.addSanitize(prefix));
    argsNodeToPass.addChild(prefix);
    argsNodeToPass.addChild(this.addSanitize(padding));
    argsNodeToPass.addChild(this.addSanitize(suffix));
    argsNodeToPass.addChild(suffix);
    return this.createAsyncExtensionNode(argsNodeToPass);
  }

  private addSanitize(node: nunjucks.nodes.Node): nunjucks.nodes.Filter {
    const filter = new nunjucks.nodes.Filter(node.lineno, node.colno);
    filter.name = new nunjucks.nodes.Symbol(
      node.lineno,
      node.colno,
      SANITIZER_NAME
    );
    const args = new nunjucks.nodes.NodeList(node.lineno, node.colno);
    // The first argument is the target of the filter
    args.addChild(node);
    filter.args = args;
    return filter;
  }
}
