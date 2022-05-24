import {
  NunjucksTagExtension,
  NunjucksTagExtensionParseResult,
  NunjucksTagExtensionRunOptions,
} from '../extension';
import * as nunjucks from 'nunjucks';
import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';

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
    nodes: typeof nunjucks.nodes
  ): NunjucksTagExtensionParseResult {
    // get the tag token
    const token = parser.nextToken();

    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    const requestQuery = parser.parseUntilBlocks('endreq');
    parser.advanceAfterBlockEnd();

    const variable = args.children[0];
    if (!variable) {
      parser.fail(`Expected a variable`, token.lineno, token.colno);
    }
    if (!(variable instanceof nodes.Symbol)) {
      parser.fail(
        `Expected a symbol, but got ${variable.typename}`,
        variable.lineno,
        variable.colno
      );
    }

    const variableName = new nodes.Literal(
      variable.colno,
      variable.lineno,
      (variable as nunjucks.nodes.Symbol).value
    );

    const argsNodeToPass = new nodes.NodeList(args.lineno, args.colno);
    argsNodeToPass.addChild(variableName);

    return {
      argsNodeList: argsNodeToPass,
      contentNodes: [requestQuery],
    };
  }

  public async run({ context, args }: NunjucksTagExtensionRunOptions) {
    const name: string = args[0];
    const requestQuery: () => string = args[1];
    const query = requestQuery()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');
    const builder = await this.executor.createBuilder(query);
    context.setVariable(name, builder);
  }
}
