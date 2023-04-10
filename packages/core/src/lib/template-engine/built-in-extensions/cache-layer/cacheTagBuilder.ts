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
    // {% cache %} query {% endcache %}
    const cacheToken = parser.nextToken();

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

    // prepare the arguments node to pass to runner for "run" method used.
    const argsNodeToPass = new nodes.NodeList(
      cacheToken.lineno,
      cacheToken.colno
    );
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
