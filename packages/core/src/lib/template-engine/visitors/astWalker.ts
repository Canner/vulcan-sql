import * as nunjucks from 'nunjucks';
import { Visitor } from './visitor';

export const walkAst = (
  root: nunjucks.nodes.Node,
  visitors: Visitor[]
): void => {
  visitors.forEach((visitor) => visitor.visit(root));

  if (root instanceof nunjucks.nodes.NodeList) {
    root.children.forEach((node) => {
      walkAst(node, visitors);
    });
  } else if (root instanceof nunjucks.nodes.CallExtension) {
    if (root.args) {
      walkAst(root.args, visitors);
    }
    if (root.contentArgs) {
      root.contentArgs.forEach((n) => {
        walkAst(n, visitors);
      });
    }
  } else {
    root.iterFields((node) => {
      if (node instanceof nunjucks.nodes.Node) {
        walkAst(node, visitors);
      }
    });
  }
};
