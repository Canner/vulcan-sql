import {
  NunjucksTagExtension,
  NunjucksTagExtensionParseResult,
  NunjucksTagExtensionRunOptions,
} from '../extension';
import * as nunjucks from 'nunjucks';

// TODO: temporary interface
export interface Executor {
  executeQuery(query: string): Promise<object>;
}

export class ReqExtension implements NunjucksTagExtension {
  public name = 'built-in-req';
  public tags = ['req'];
  private executor: Executor;

  constructor({ executor }: { executor: Executor }) {
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
    const result = await this.executor.executeQuery(query);
    context.setVariable(name, result);
  }
}
