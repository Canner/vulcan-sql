import {
  NunjucksTagExtension,
  NunjucksTagExtensionParseResult,
  NunjucksTagExtensionRunOptions,
} from '../extension';
import * as nunjucks from 'nunjucks';
import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';

const FINIAL_BUILDER_NAME = 'FINAL_BUILDER';

// TODO: temporary interface
export interface QueryBuilder {
  count(): QueryBuilder;
  value(): Promise<any>;
}

export interface Executor {
  createBuilder(query: string): Promise<QueryBuilder>;
}

@injectable()
export class ReqExtension implements NunjucksTagExtension {
  public name = 'built-in-req';
  public tags = ['req'];
  private executor: Executor;

  constructor(@inject(TYPES.Executor) executor: Executor) {
    this.executor = executor;
  }

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ): NunjucksTagExtensionParseResult {
    // {% req var (main) %} body {% endreq %}
    // consume req tag
    const reqToken = parser.nextToken();
    // variable
    let nextToken = parser.peekToken();
    if (nextToken.type === lexer.TOKEN_BLOCK_END) {
      // {% req %}
      parser.fail(`Expected a variable`, nextToken.lineno, nextToken.colno);
    }
    if (nextToken.type !== lexer.TOKEN_SYMBOL) {
      parser.fail(
        `Expected a symbol, but got ${nextToken.type}`,
        nextToken.lineno,
        nextToken.colno
      );
    }
    const variable = parser.parseExpression();

    // main denotation
    nextToken = parser.peekToken();
    let mainBuilder = false;
    if (nextToken.type !== lexer.TOKEN_BLOCK_END) {
      if (nextToken.type !== lexer.TOKEN_SYMBOL || nextToken.value !== 'main') {
        parser.fail(
          `Expected a symbol "main"`,
          nextToken.lineno,
          nextToken.colno
        );
      }
      mainBuilder = true;
      // Consume this token (main)
      parser.nextToken();
    }

    const endToken = parser.nextToken();
    if (endToken.type !== lexer.TOKEN_BLOCK_END) {
      parser.fail(
        `Expected a block end, but got ${endToken.type}`,
        endToken.lineno,
        endToken.colno
      );
    }

    const requestQuery = parser.parseUntilBlocks('endreq');
    parser.advanceAfterBlockEnd();

    const argsNodeToPass = new nodes.NodeList(reqToken.lineno, reqToken.colno);
    // variable name
    argsNodeToPass.addChild(
      new nodes.Literal(
        variable.colno,
        variable.lineno,
        (variable as nunjucks.nodes.Symbol).value
      )
    );
    // is main builder
    argsNodeToPass.addChild(
      new nodes.Literal(variable.colno, variable.lineno, String(mainBuilder))
    );

    return {
      argsNodeList: argsNodeToPass,
      contentNodes: [requestQuery],
    };
  }

  public async run({
    context,
    args,
    contentArgs,
  }: NunjucksTagExtensionRunOptions) {
    const name = args[0];
    let query = '';
    for (let index = 0; index < contentArgs.length; index++) {
      query += await contentArgs[index]();
    }
    query = query
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');
    const builder = await this.executor.createBuilder(query);
    context.setVariable(name, builder);

    if (Boolean(args[1])) {
      context.setVariable(FINIAL_BUILDER_NAME, builder);
      context.addExport(FINIAL_BUILDER_NAME);
    }
  }
}
