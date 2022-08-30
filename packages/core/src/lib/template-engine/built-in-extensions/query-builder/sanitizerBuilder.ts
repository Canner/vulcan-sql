import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import * as nunjucks from 'nunjucks';
import { visitChildren } from '../../extension-utils';
import { SANITIZER_NAME } from './constants';

@VulcanInternalExtension()
export class SanitizerBuilder extends FilterBuilder {
  public filterName = SANITIZER_NAME;
  public override onVisit(node: nunjucks.nodes.Node): void {
    if (node instanceof nunjucks.nodes.Root) this.addSanitizer(node);
  }

  private addSanitizer(node: nunjucks.nodes.Node, parentHasOutputNode = false) {
    visitChildren(node, (child, replace) => {
      if (
        child instanceof nunjucks.nodes.LookupVal ||
        child instanceof nunjucks.nodes.FunCall ||
        child instanceof nunjucks.nodes.Symbol
      ) {
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
}
