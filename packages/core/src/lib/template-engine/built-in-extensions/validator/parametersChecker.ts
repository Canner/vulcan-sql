import {
  CompileTimeExtension,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { chain } from 'lodash';
import * as nunjucks from 'nunjucks';
import {
  LOOK_UP_PARAMETER,
  PARAMETER_METADATA_NAME,
  REFERENCE_SEARCH_MAX_DEPTH,
} from './constants';

interface Parameter {
  name: string;
  lineNo: number;
  columnNo: number;
}

@VulcanInternalExtension()
export class ParametersChecker extends CompileTimeExtension {
  public override metadataName = PARAMETER_METADATA_NAME;
  private parameters: Parameter[] = [];

  public override onVisit(node: nunjucks.nodes.Node): void {
    if (node instanceof nunjucks.nodes.LookupVal) {
      let name = node.val.value;
      let parent: typeof node.target | null = node.target;
      let depth = 0;
      while (parent) {
        depth++;
        if (depth > REFERENCE_SEARCH_MAX_DEPTH) {
          throw new Error('Max depth reached');
        }
        if (parent instanceof nunjucks.nodes.LookupVal) {
          name = parent.val.value + '.' + name;
          parent = parent.target;
        } else if (parent instanceof nunjucks.nodes.FunCall) {
          parent = parent.name;
        } else {
          if (parent.value === LOOK_UP_PARAMETER) {
            this.parameters.push({
              name,
              lineNo: node.lineno,
              columnNo: node.colno,
            });
          }
          parent = null;
        }
      }
    }
  }

  public override getMetadata() {
    return chain(this.parameters)
      .groupBy('name')
      .values()
      .map((parameters) => ({
        name: parameters[0].name,
        locations: parameters.map((parameter) => ({
          lineNo: parameter.lineNo,
          columnNo: parameter.columnNo,
        })),
      }))
      .value();
  }
}
