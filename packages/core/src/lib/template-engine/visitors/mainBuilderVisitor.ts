import { Visitor } from './visitor';
import * as nunjucks from 'nunjucks';

const ReqExtensionName = 'built-in-req';

export class MainBuilderVisitor implements Visitor {
  private root?: nunjucks.nodes.Root;
  private hasMainBuilder = false;

  public visit(node: nunjucks.nodes.Node) {
    // save the root
    if (node instanceof nunjucks.nodes.Root) {
      this.root = node;
    }
    this.checkMainBuilder(node);
  }

  public finish() {
    if (!this.hasMainBuilder) {
      this.wrapOutputWithBuilder();
    }
  }

  private checkMainBuilder(node: nunjucks.nodes.Node) {
    const isMainBuilder =
      node instanceof nunjucks.nodes.CallExtensionAsync &&
      node.extName === ReqExtensionName &&
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
    const builder = new nunjucks.nodes.CallExtensionAsync(
      ReqExtensionName,
      '__run',
      args,
      originalChildren
    );
    this.root.children = [builder];
  }
}
