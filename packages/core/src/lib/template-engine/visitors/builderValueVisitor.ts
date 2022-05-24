import * as nunjucks from 'nunjucks';
import { ReplaceChildFunc, visitChildren } from './astWalker';
import { Visitor } from './visitor';

const MAX_DEPTH = 100;

// Replace .value() function of builders with a async filter
export class BuilderValueVisitor implements Visitor {
  private builderCreatorExtensionName: string;
  private executeCommandName: string;
  private executeFilterName: string;

  private variableList = new Set<string>();

  constructor({
    builderCreatorExtensionName = 'built-in-req',
    executeCommandName = 'value',
    executeFilterName = 'execute',
  }: {
    builderCreatorExtensionName?: string;
    executeCommandName?: string;
    executeFilterName?: string;
  } = {}) {
    this.builderCreatorExtensionName = builderCreatorExtensionName;
    this.executeCommandName = executeCommandName;
    this.executeFilterName = executeFilterName;
  }

  public visit(node: nunjucks.nodes.Node) {
    // Record the variable name if it is a extension node
    if (
      node instanceof nunjucks.nodes.CallExtensionAsync &&
      node.extName === this.builderCreatorExtensionName
    ) {
      const variable = node.args.children[0] as nunjucks.nodes.Literal;
      this.variableList.add(variable.value);
      return;
    }

    visitChildren(node, this.visitChild.bind(this));
  }

  private visitChild(node: nunjucks.nodes.Node, replace: ReplaceChildFunc) {
    if (
      node instanceof nunjucks.nodes.FunCall &&
      node.name instanceof nunjucks.nodes.LookupVal &&
      node.name.val.value === this.executeCommandName
    ) {
      let targetNode: typeof node.name.target | null = node.name.target;
      let depth = 0;
      while (targetNode) {
        depth++;
        if (depth > MAX_DEPTH) {
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
            this.executeFilterName
          ),
          args
        );
        replace(filter);
      }
    }
  }
}
