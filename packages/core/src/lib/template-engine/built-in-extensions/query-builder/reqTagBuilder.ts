import {
  OnAstVisit,
  ProvideMetadata,
  ReplaceChildFunc,
  TagBuilder,
  visitChildren,
} from '../../extension-loader';
import * as nunjucks from 'nunjucks';
import {
  EXECUTE_COMMAND_NAME,
  EXECUTE_FILTER_NAME,
  FINIAL_BUILDER_NAME,
  METADATA_NAME,
  REFERENCE_SEARCH_MAX_DEPTH,
} from './constants';

interface DeclarationLocation {
  lineNo: number;
  colNo: number;
}

export class ReqTagBuilder
  extends TagBuilder
  implements OnAstVisit, ProvideMetadata
{
  public tags = ['req'];
  public metadataName = METADATA_NAME;
  private root?: nunjucks.nodes.Root;
  private hasMainBuilder = false;
  private variableList = new Map<string, DeclarationLocation>();

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
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
        variable.lineno,
        variable.colno,
        (variable as nunjucks.nodes.Symbol).value
      )
    );
    // is main builder
    argsNodeToPass.addChild(
      new nodes.Literal(variable.lineNo, variable.colno, String(mainBuilder))
    );

    return this.createAsyncExtensionNode(argsNodeToPass, [requestQuery]);
  }

  public onVisit(node: nunjucks.nodes.Node) {
    // save the root
    if (node instanceof nunjucks.nodes.Root) {
      this.root = node;
    } else if (
      node instanceof nunjucks.nodes.CallExtensionAsync &&
      node.extName === this.getName()
    ) {
      this.checkBuilder(node);
      this.checkMainBuilder(node);
    } else {
      visitChildren(node, this.replaceExecuteFunction.bind(this));
    }
  }

  public finish() {
    if (!this.hasMainBuilder) {
      this.wrapOutputWithBuilder();
    }
  }

  public getMetadata() {
    return {
      finalBuilderName: FINIAL_BUILDER_NAME,
    };
  }

  private checkBuilder(node: nunjucks.nodes.CallExtensionAsync) {
    const variable = node.args.children[0] as nunjucks.nodes.Literal;
    if (this.variableList.has(variable.value)) {
      const previousDeclaration = this.variableList.get(variable.value);
      throw new Error(
        `We can't declare multiple builder with same name. Duplicated name: ${variable.value} (declared at ${previousDeclaration?.lineNo}:${previousDeclaration?.colNo} and ${variable.lineno}:${variable.colno})`
      );
    }
    this.variableList.set(variable.value, {
      lineNo: variable.lineno,
      colNo: variable.colno,
    });
  }

  private checkMainBuilder(node: nunjucks.nodes.CallExtensionAsync) {
    const isMainBuilder =
      node.extName === this.getName() &&
      (node.args.children[1] as nunjucks.nodes.Literal).value === 'true';
    if (!isMainBuilder) return;

    if (this.hasMainBuilder) {
      throw new Error(`Only one main builder is allowed.`);
    }
    this.hasMainBuilder = true;
  }

  private wrapOutputWithBuilder() {
    if (!this.root) {
      throw new Error('No root node found.');
    }
    const originalChildren = this.root.children;
    const args = new nunjucks.nodes.NodeList(0, 0);
    // variable name
    args.addChild(new nunjucks.nodes.Literal(0, 0, '__wrapped__builder'));
    // is main builder
    args.addChild(new nunjucks.nodes.Literal(0, 0, 'true'));
    const builder = this.createAsyncExtensionNode(args, originalChildren);
    this.root.children = [builder];
  }

  private replaceExecuteFunction(
    node: nunjucks.nodes.Node,
    replace: ReplaceChildFunc
  ) {
    if (
      node instanceof nunjucks.nodes.FunCall &&
      node.name instanceof nunjucks.nodes.LookupVal &&
      node.name.val.value === EXECUTE_COMMAND_NAME
    ) {
      let targetNode: typeof node.name.target | null = node.name.target;
      let depth = 0;
      while (targetNode) {
        depth++;
        if (depth > REFERENCE_SEARCH_MAX_DEPTH) {
          throw new Error('Max depth reached');
        }
        if (targetNode instanceof nunjucks.nodes.LookupVal) {
          targetNode = targetNode.target;
        } else if (targetNode instanceof nunjucks.nodes.FunCall) {
          targetNode = targetNode.name;
        } else if (targetNode instanceof nunjucks.nodes.Symbol) {
          break;
        } else {
          throw new Error(
            `Unexpected node type: ${
              (targetNode as nunjucks.nodes.Node)?.typename
            }`
          );
        }
      }

      // If the target node is a variable from {% req xxx %}, replace it with execute filter
      if (this.variableList.has((targetNode as nunjucks.nodes.Symbol).value)) {
        const args = new nunjucks.nodes.NodeList(node.lineno, node.colno);
        args.addChild(node.name.target);
        const filter = new nunjucks.nodes.Filter(
          node.lineno,
          node.colno,
          new nunjucks.nodes.Symbol(
            node.lineno,
            node.colno,
            EXECUTE_FILTER_NAME
          ),
          args
        );
        replace(filter);
      }
    }
  }
}
