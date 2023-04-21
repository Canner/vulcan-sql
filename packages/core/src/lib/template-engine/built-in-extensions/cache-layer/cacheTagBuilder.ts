import * as nunjucks from 'nunjucks';
import { TagBuilder, VulcanInternalExtension } from '@vulcan-sql/core/models';
import { METADATA_NAME } from './constants';

@VulcanInternalExtension()
export class CacheTagBuilder extends TagBuilder {
  public tags = ['cache'];
  private isUsedTag = false;
  public override metadataName = METADATA_NAME;

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    // The cache tag could set variable name or not.
    // Has variable name: we use the variable and keep the builder in the variable, and make user could use by xxx.value() like the req feature.
    // Not has variable name: means you would like to get the result directly after query, then we will replace the original query main builder to the cache builder.
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

    // if the next token is a symbol, it means the user set the variable name.
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
    }
    // consume the end token
    const endToken = parser.nextToken();
    if (endToken.type !== lexer.TOKEN_BLOCK_END) {
      parser.fail(
        `Expected a block end, but got ${endToken.type}`,
        endToken.lineno,
        endToken.colno
      );
    }

    // get query statement to send to the cache layer by parsing tokens between current position to the targe blocks.
    const queryToCache = parser.parseUntilBlocks('endcache');
    parser.advanceAfterBlockEnd();

    return this.createAsyncExtensionNode(argsNodeToPass, [queryToCache]);
  }

  public override onVisit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.CallExtension) {
      if (node.extName !== this.getName()) return;
      // mark used the cache tag
      this.isUsedTag = true;
    }
  }

  public override getMetadata() {
    return {
      isUsedTag: this.isUsedTag,
    };
  }
}
