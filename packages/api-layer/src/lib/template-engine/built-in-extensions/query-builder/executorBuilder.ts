import {
  FilterBuilder,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { EXECUTE_COMMAND_NAME, EXECUTE_FILTER_NAME } from './constants';
import * as nunjucks from 'nunjucks';
import { ReplaceChildFunc, visitChildren } from '../../extension-utils';

@VulcanInternalExtension()
export class ExecutorBuilder extends FilterBuilder {
  public filterName = EXECUTE_FILTER_NAME;

  public override onVisit(node: nunjucks.nodes.Node) {
    visitChildren(node, this.replaceExecuteFunction.bind(this));
  }

  private replaceExecuteFunction(
    node: nunjucks.nodes.Node,
    replace: ReplaceChildFunc
  ) {
    if (
      node instanceof nunjucks.nodes.FunCall &&
      node.name instanceof nunjucks.nodes.LookupVal &&
      node.name.val.value === EXECUTE_COMMAND_NAME
    ) {
      const args = new nunjucks.nodes.NodeList(node.lineno, node.colno);
      args.addChild(node.name.target);
      const filter = new nunjucks.nodes.Filter(
        node.lineno,
        node.colno,
        new nunjucks.nodes.Symbol(node.lineno, node.colno, EXECUTE_FILTER_NAME),
        args
      );
      replace(filter);
    }
  }
}
