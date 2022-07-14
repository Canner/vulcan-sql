import { TYPES } from '@vulcan-sql/core/containers';
import { inject, named } from 'inversify';
import {
  CompileTimeExtension,
  OnAstVisit,
  ProvideMetadata,
} from '../../extension-loader';
import { FILTER_METADATA_NAME } from './constants';
import * as nunjucks from 'nunjucks';

export class FilterChecker
  extends CompileTimeExtension
  implements OnAstVisit, ProvideMetadata
{
  public metadataName = FILTER_METADATA_NAME;
  private env: nunjucks.Environment;
  private filters = new Set<string>();

  constructor(
    @inject(TYPES.CompilerEnvironment)
    @named('compileTime')
    compileTimeEnv: nunjucks.Environment
  ) {
    super();
    this.env = compileTimeEnv;
  }

  public onVisit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.Filter) {
      if (
        node.name instanceof nunjucks.nodes.Symbol ||
        node.name instanceof nunjucks.nodes.Literal
      ) {
        // If the node is a filter and has a expected name node, we check whether the filter is loaded.
        // If the filter is not loaded, getFilter function will throw an error.
        this.env.getFilter(node.name.value);
        this.filters.add(node.name.value);
      }
    }
  }

  public getMetadata() {
    return Array.from(this.filters);
  }
}
