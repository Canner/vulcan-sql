import * as nunjucks from 'nunjucks';

export interface Visitor {
  visit: (node: nunjucks.nodes.Node) => void;
  reset: () => void;
}
