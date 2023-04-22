import * as nunjucks from 'nunjucks';
import { TagBuilder, VulcanInternalExtension } from '@vulcan-sql/core/models';
import { CACHE_MAIN_BUILDER_VAR_NAME, METADATA_NAME } from './constants';
import { TemplateError } from '../../../utils/errors';

interface DeclarationLocation {
  lineNo: number;
  colNo: number;
}
@VulcanInternalExtension()
export class CacheTagBuilder extends TagBuilder {
  public tags = ['cache'];
  private isUsedTag = false;
  // Check one sql file could not exist duplicate cache tag without variable.
  private hasMainBuilder = false;
  private variableList = new Map<string, DeclarationLocation>();
  public override metadataName = METADATA_NAME;

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    // The cache tag could set variable name or not.
    // Has variable name: we use the variable and keep the builder in the variable, and make user could use by xxx.value() like the req feature.
    // Not has variable name: means it's cache main builder that you would like to get the result directly after query, then we will replace the original query main builder to the cache main builder.
    // {% cache (var) %} query {% endcache %}
    const cacheToken = parser.nextToken();

    const peekToken = parser.peekToken();
    // check if the next token is a block end or a symbol
    if (![lexer.TOKEN_BLOCK_END, lexer.TOKEN_SYMBOL].includes(peekToken.type)) {
      parser.fail(
        `Expected a symbol or a block end, but got ${peekToken.type}`,
        peekToken.lineno,
        peekToken.colno
      );
    }

    // prepare the arguments node to pass to runner for "run" method used.
    const argsNodeToPass = new nodes.NodeList(
      cacheToken.lineno,
      cacheToken.colno
    );

    // If the next token is a end block, it means the user use the cache main builder
    if (peekToken.type === lexer.TOKEN_BLOCK_END) {
      // consume the end token
      parser.nextToken();
      // add variable name literal node for passing to "run" method used.
      argsNodeToPass.addChild(
        new nodes.Literal(
          cacheToken.lineno,
          cacheToken.colno,
          CACHE_MAIN_BUILDER_VAR_NAME
        )
      );
    }
    // If the next token is a symbol, it means the user set the variable name.
    if (peekToken.type === lexer.TOKEN_SYMBOL) {
      // parse to get and consume the variable token
      const variable = parser.parseExpression();
      // add variable name literal node for passing to "run" method used.
      argsNodeToPass.addChild(
        new nodes.Literal(
          variable.lineno,
          variable.colno,
          (variable as nunjucks.nodes.Symbol).value
        )
      );
      // consume the end token
      const endToken = parser.nextToken();
      if (endToken.type !== lexer.TOKEN_BLOCK_END) {
        parser.fail(
          `Expected a block end, but got ${endToken.type}`,
          endToken.lineno,
          endToken.colno
        );
      }
    }

    // Get query statement to send to the cache layer by parsing tokens between current position to the targe blocks.
    const queryToCache = parser.parseUntilBlocks('endcache');
    parser.advanceAfterBlockEnd();

    return this.createAsyncExtensionNode(argsNodeToPass, [queryToCache]);
  }

  public override onVisit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.CallExtension) {
      if (node.extName !== this.getName()) return;
      this.checkCacheTagBuilder(node);
      this.checkMainBuilder(node);
      // mark used the isMainBuilder tag
      this.isUsedTag = true;
    }
  }

  public override getMetadata() {
    return {
      isUsedTag: this.isUsedTag,
    };
  }

  public override finish() {
    this.reset();
  }

  private checkCacheTagBuilder(node: nunjucks.nodes.CallExtensionAsync) {
    const variable = node.args.children[0] as nunjucks.nodes.Literal;
    if (this.variableList.has(variable.value)) {
      const previousDeclaration = this.variableList.get(variable.value);
      if (variable.value !== CACHE_MAIN_BUILDER_VAR_NAME)
        throw new TemplateError(
          `We can't declare multiple cache tag builder with same name. Duplicated name: ${variable.value} (declared at ${previousDeclaration?.lineNo}:${previousDeclaration?.colNo} and ${variable.lineno}:${variable.colno})`
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
      (node.args.children[0] as nunjucks.nodes.Literal).value ===
        CACHE_MAIN_BUILDER_VAR_NAME;
    if (!isMainBuilder) return;

    if (this.hasMainBuilder) {
      throw new TemplateError(
        `Only one cache tag without variable is allowed.`
      );
    }
    this.hasMainBuilder = true;
  }
  private reset() {
    this.variableList.clear();
    this.hasMainBuilder = false;
  }
}
