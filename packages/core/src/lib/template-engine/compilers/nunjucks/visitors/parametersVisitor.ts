import * as nunjucks from 'nunjucks';
import { Visitor } from './visitor';

const MAX_DEPTH = 100;

export class ParameterVisitor implements Visitor {
  private parameters = new Set<string>();
  private lookupParameter: string;

  constructor({
    lookupParameter = 'params',
  }: { lookupParameter?: string } = {}) {
    this.lookupParameter = lookupParameter;
  }

  public visit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.LookupVal) {
      let name = node.val.value;
      let parent: nunjucks.nodes.LookupVal | nunjucks.nodes.Symbol | null =
        node.target;
      let depth = 0;
      while (parent) {
        depth++;
        if (depth > MAX_DEPTH) {
          throw new Error('Max depth reached');
        }
        if (parent instanceof nunjucks.nodes.LookupVal) {
          name = parent.val.value + '.' + name;
          parent = parent.target;
        } else {
          if (parent.value === this.lookupParameter) {
            this.parameters.add(name);
          }
          parent = null;
        }
      }
    }
  }

  public reset() {
    this.parameters.clear();
  }

  public getParameters() {
    return Array.from(this.parameters.values());
  }
}
