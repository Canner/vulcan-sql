import * as nunjucks from 'nunjucks';
import { Visitor } from './visitor';

export const walkAst = (
  root: nunjucks.nodes.Node,
  visitors: Visitor[]
): void => {
  visitors.forEach((visitor) => visitor.visit(root));
  visitChildren(root, (node) => walkAst(node, visitors));
  if (root instanceof nunjucks.nodes.Root) {
    visitors.forEach((visitor) => visitor.finish?.());
  }
};

export type VisitChildCallback = (
  node: nunjucks.nodes.Node,
  replaceFunc: ReplaceChildFunc
) => void;

export type ReplaceChildFunc = (
  /** Provide the node you want to replace, or null if you want to delete this child */
  replaceNode:
    | nunjucks.nodes.NodeList
    | nunjucks.nodes.CallExtension
    | nunjucks.nodes.Node
    | null
) => void;

export const visitChildren = (
  root: nunjucks.nodes.Node,
  callBack: VisitChildCallback
) => {
  if (root instanceof nunjucks.nodes.NodeList) {
    const indexToRemove: number[] = [];
    root.children.forEach((node, index) => {
      callBack(node, (replaced) => {
        if (replaced) {
          root.children[index] = replaced;
        } else {
          indexToRemove.push(index);
        }
      });
    });
    // Must delete in reverse order
    for (let index = indexToRemove.length - 1; index >= 0; index--) {
      root.children.splice(indexToRemove[index], 1);
    }
  } else if (root instanceof nunjucks.nodes.CallExtension) {
    if (root.args) {
      callBack(root.args, (replaced) => {
        if (!replaced) {
          root.args = new nunjucks.nodes.NodeList(
            root.args.lineno,
            root.args.colno
          );
        } else if (replaced instanceof nunjucks.nodes.NodeList) {
          root.args = replaced;
        } else {
          root.args = new nunjucks.nodes.NodeList(
            root.args.lineno,
            root.args.colno
          );
          root.args.addChild(replaced);
        }
      });
    }
    if (root.contentArgs) {
      const indexToRemove: number[] = [];
      root.contentArgs.forEach((node, index) => {
        callBack(node, (replaced) => {
          if (replaced && root.contentArgs) {
            root.contentArgs[index] = replaced;
          } else {
            indexToRemove.push(index);
          }
        });
      });
      // Must delete in reverse order
      for (let index = indexToRemove.length - 1; index >= 0; index--) {
        root.contentArgs.splice(indexToRemove[index], 1);
      }
    }
  } else {
    root.iterFields((node, fieldName) => {
      if (node instanceof nunjucks.nodes.Node) {
        callBack(node, (replaced) => {
          if (replaced) {
            (root as any)[fieldName] = replaced;
          } else {
            delete (root as any)[fieldName];
          }
        });
      }
    });
  }
};
