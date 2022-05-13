import { chain } from 'lodash';
import * as nunjucks from 'nunjucks';
import { TemplateParameterMetadata } from '../compiler';
import { Visitor } from './visitor';

const MAX_DEPTH = 100;

interface Parameter {
  name: string;
  lineNo: number;
  columnNo: number;
}

export class ParametersVisitor implements Visitor {
  private parameters: Parameter[] = [];
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

  public getParameters(): TemplateParameterMetadata[] {
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
