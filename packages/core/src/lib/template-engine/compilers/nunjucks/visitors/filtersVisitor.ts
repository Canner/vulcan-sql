import * as nunjucks from 'nunjucks';
import { Visitor } from './visitor';

export class FiltersVisitor implements Visitor {
  private env: nunjucks.Environment;

  constructor({ env }: { env: nunjucks.Environment }) {
    this.env = env;
  }

  public visit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.Filter) {
      if (
        node.name instanceof nunjucks.nodes.Symbol ||
        node.name instanceof nunjucks.nodes.Literal
      ) {
        // If the node is a filter and has a expected name node, we check whether the filter is loaded.
        // If the filter is not loaded, getFilter function will throw an error.
        this.env.getFilter(node.name.value);
      }
    }
  }
}
