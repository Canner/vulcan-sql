import { TagBuilder } from '@vulcan-sql/core';
import * as nunjucks from 'nunjucks';

export class DBTTagBuilder extends TagBuilder {
  public tags = ['dbt'];

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    // {% dbt model-name %}
    // consume dbt tag
    const dbtToken = parser.nextToken();
    const args = new nodes.NodeList(dbtToken.lineno, dbtToken.colno);

    return this.createAsyncExtensionNode(args, []);
  }
}
