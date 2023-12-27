import { VulcanExtension } from './decorators';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { sortBy } from 'lodash';
import * as nunjucks from 'nunjucks';
import { CompileTimeExtension } from './templateEngine';

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class TagBuilder<C = any> extends CompileTimeExtension<C> {
  abstract tags: string[];
  abstract parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ): nunjucks.nodes.Node;

  public set __name(_) {
    // ignore it
  }

  public get __name() {
    return this.getName();
  }

  public getName() {
    return sortBy(this.tags).join('_');
  }

  protected createAsyncExtensionNode(
    /**
     * The arguments of this extension, they'll be rendered and passed to run function.
     * It usually contains the configuration of the extension, e.g. {% req variable %} The variable name of req extension.
     * Note that these arguments will be pass to run function directly: Literal('123') => "123", so adding Output nodes causes compiling issues. Output("123") => t += "123"
     */
    argsNodeList: nunjucks.nodes.NodeList,
    /** The content (usually the body) of this extension, they'll be passed to run function as render functions
     * It usually contains the Output of your extension, e.g. {% req variable %} select * from user {% endreq %}, the "select * from user" should be put in this field.
     * Note that these nodes will be rendered as the output of template: Output("123") => t = ""; t += "123", so adding nodes with no output like Symbol, Literal ... might cause compiling issues.  Literal('123') => t = ""; 123
     */
    contentNodes: nunjucks.nodes.Node[] = []
  ) {
    return new nunjucks.nodes.CallExtensionAsync(
      this.getName(),
      '__run',
      argsNodeList,
      contentNodes
    );
  }
}
