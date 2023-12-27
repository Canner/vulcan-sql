import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import * as nunjucks from 'nunjucks';
import { visitChildren } from '../../extension-utils';
import { RAW_FILTER_NAME, SANITIZER_NAME } from './constants';

/**
 * Add a sanitizer filter after all "lookup" like nodes, e.g. LookupVal, FunctionCall ...etc. In order to do sql injection prevention.
 * {{ context.params.id }} -> {{ context.params.id | sanitizer }}
 */
@VulcanInternalExtension()
export class SanitizerBuilder extends FilterBuilder {
  public filterName = SANITIZER_NAME;
  public override onVisit(node: nunjucks.nodes.Node): void {
    if (node instanceof nunjucks.nodes.Root) this.addSanitizer(node);
  }

  private addSanitizer(node: nunjucks.nodes.Node, parentHasOutputNode = false) {
    visitChildren(node, (child, replace) => {
      // Visitor should be stopped by raw filter
      if (
        child instanceof nunjucks.nodes.Filter &&
        child.name instanceof nunjucks.nodes.Symbol &&
        child.name.value === RAW_FILTER_NAME
      ) {
        return;
      }

      if (this.isNodeNeedToBeSanitize(child)) {
        if (!parentHasOutputNode && !(node instanceof nunjucks.nodes.Output))
          return;
        const filter = new nunjucks.nodes.Filter(node.lineno, node.colno);
        filter.name = new nunjucks.nodes.Symbol(
          node.lineno,
          node.colno,
          SANITIZER_NAME
        );
        const args = new nunjucks.nodes.NodeList(node.lineno, node.colno);
        // The first argument is the target of the filter
        args.addChild(child);
        filter.args = args;
        replace(filter);
      } else {
        this.addSanitizer(
          child,
          parentHasOutputNode || node instanceof nunjucks.nodes.Output
        );
      }
    });
  }

  private isNodeNeedToBeSanitize(node: nunjucks.nodes.Node): boolean {
    return (
      node instanceof nunjucks.nodes.LookupVal ||
      // includes FunCall, Filter
      node instanceof nunjucks.nodes.FunCall ||
      node instanceof nunjucks.nodes.Symbol
    );
  }
}
