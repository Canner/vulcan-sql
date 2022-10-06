import {
  CompileTimeExtension,
  ValidatorDefinition,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { chain, values } from 'lodash';
import * as nunjucks from 'nunjucks';
import { InternalError, TemplateError } from '@vulcan-sql/core/utils';
import {
  LOOK_UP_PARAMETER,
  PARAMETER_METADATA_NAME,
  REFERENCE_SEARCH_MAX_DEPTH,
} from './constants';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { IValidatorLoader } from '@vulcan-sql/core/validators';
import {
  getValidationFilterName,
  getValidatorName,
  visitChildren,
} from '../../extension-utils';

interface ValidationFilter extends nunjucks.nodes.Filter {
  name: nunjucks.nodes.Symbol; // a.b
  val: nunjucks.nodes.Value;
}

interface Parameter {
  name: string;
  nodes: nunjucks.nodes.LookupVal[];
  validators: ValidatorDefinition[];
}

// Validation filters (VF) which meet the following requirements can be PreCheck Validation Filters (PCVF)
// 1. All arguments should be static. (O) context.params.id | number(max=20) , (X) context.params.id | number(max=var)
// 2. Filters should be applied right after the parameters. (O) context.params.id | number(max=20), (X) context.params.id | upper | number(max=20)
// 3. Filters should not be applied on the children of parameters. (O) context.params.id | number(max=20), (X) context.params.id.account | number(max=20)

@VulcanInternalExtension()
export class ParametersChecker extends CompileTimeExtension {
  public override metadataName = PARAMETER_METADATA_NAME;
  private parameters = new Map<string, Parameter>();
  private validationFilterNames: Set<string>;

  constructor(
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) moduleName: string,
    @inject(TYPES.ValidatorLoader) validatorLoader: IValidatorLoader
  ) {
    super(config, moduleName);
    this.validationFilterNames = new Set<string>();
    validatorLoader
      .getValidators()
      .forEach((validator) =>
        this.validationFilterNames.add(getValidationFilterName(validator))
      );
  }

  public override onVisit(node: nunjucks.nodes.Node): void {
    // Clear parameters at the begin
    if (node instanceof nunjucks.nodes.Root) this.parameters.clear();

    // Extract parameter from lookupVal node: {{ context.params.xxx }}
    if (node instanceof nunjucks.nodes.LookupVal) {
      const parameter = this.getParametersOfLookupNode(node);
      this.addParameter(parameter);
      return;
    }

    // Visit the children and replace the preCheck validation filters. {{ context.params.xxx | xxx() }}
    visitChildren(node, (child, replace) => {
      if (!this.isPreCheckValidationFilterNode(child)) return;
      const parameter = this.getParametersOfPCVFNode(child);
      if (!parameter) return;
      replace(parameter.nodes[0]);
      this.addParameter(parameter);
    });
  }

  public override getMetadata() {
    return chain(Array.from(this.parameters.values()))
      .map((parameter) => ({
        name: parameter.name,
        locations: parameter.nodes.map((node) => ({
          lineNo: node.lineno,
          columnNo: node.colno,
        })),
        validators: parameter.validators,
      }))
      .value();
  }

  /** Get parameters from PreCheck Validation Filter node */
  private getParametersOfPCVFNode(node: ValidationFilter): Parameter | null {
    const target = node.args.children[0];
    let parameter: Parameter | null = null;

    if (target instanceof nunjucks.nodes.LookupVal) {
      // Get the parameter if our target is a lookup node
      parameter = this.getParametersOfLookupNode(target);
    } else if (this.isPreCheckValidationFilterNode(target)) {
      // Get its parameter if our target is still a PreCheck node
      parameter = this.getParametersOfPCVFNode(target);
    }

    // Check args
    const args: Record<string, any> = {};
    const argsNode = node.args.children[1];
    if (argsNode) {
      // (max=10, min=0)  --> KeywordArgs
      if (!(argsNode instanceof nunjucks.nodes.KeywordArgs)) {
        throw new TemplateError(
          `The arguments of validation filter ${node.name.value} is invalid`,
          {
            node: argsNode,
          }
        );
      }

      for (const arg of argsNode.children) {
        // max=10 --> Pair
        if (!(arg instanceof nunjucks.nodes.Pair)) {
          throw new TemplateError(
            `The arguments of validation filter ${node.name.value} is invalid`,
            {
              node: arg,
            }
          );
        }

        if (arg.value instanceof nunjucks.nodes.Literal) {
          // Static value, set the value. e.g. a=1, a="s", a=true ...
          args[arg.key.value] = arg.value.value;
        } else if (
          arg.value instanceof nunjucks.nodes.Array &&
          arg.value.children.every(
            (child) => child instanceof nunjucks.nodes.Literal
          )
        ) {
          // Static array value, set the value. e.g. a=[1,2,3]
          args[arg.key.value] = arg.value.children.map(
            (child) => (child as nunjucks.nodes.Literal).value
          );
        } else {
          // Dynamic value, set to null because we know the value only when executing.
          args[arg.key.value] = null;
        }
      }
    }

    // 1. All arguments should be static. (O) context.params.id | number(max=20) , (X) context.params.id | number(max=var)
    if (values(args).some((value) => value === null)) return null;

    // 3. Filters should not be applied on the children of parameters. (O) context.params.id | number(max=20), (X) context.params.id.account | number(max=20)
    if (parameter?.name.includes('.')) return null;

    parameter?.validators.push({
      name: getValidatorName(node.name.value),
      args,
    });

    return parameter;
  }

  /** Return the name and position of parameters if found */
  private getParametersOfLookupNode(
    node: nunjucks.nodes.LookupVal
  ): Parameter | null {
    let name = node.val.value;
    let target: typeof node.target | null = node.target;
    let depth = 0;
    while (target) {
      depth++;
      if (depth > REFERENCE_SEARCH_MAX_DEPTH) {
        throw new InternalError('Max depth reached');
      }
      if (target instanceof nunjucks.nodes.LookupVal) {
        name = target.val.value + '.' + name;
        target = target.target;
      } else if (target instanceof nunjucks.nodes.FunCall) {
        target = target.name;
      } else {
        name = target.value + '.' + name;
        const lookUp = LOOK_UP_PARAMETER + '.';
        if (name.startsWith(lookUp)) {
          return {
            name: name.replace(lookUp, ''),
            validators: [],
            nodes: [node],
          };
        }
        break;
      }
    }
    return null;
  }

  private isValidationFilterNode(
    node: nunjucks.nodes.Node
  ): node is ValidationFilter {
    return (
      node instanceof nunjucks.nodes.Filter &&
      node.name instanceof nunjucks.nodes.Symbol &&
      this.validationFilterNames.has(node.name.value)
    );
  }

  private isPreCheckValidationFilterNode(
    node: nunjucks.nodes.Node
  ): node is ValidationFilter {
    return (
      this.isValidationFilterNode(node) &&
      // 1. All arguments should be static.
      node.args.children
        .slice(1) // The first argument is the target of the filter
        .every((arg) => !(arg instanceof nunjucks.nodes.LookupVal))
    );
  }

  private addParameter(parameter?: Parameter | null) {
    if (!parameter) return;
    if (!this.parameters.has(parameter.name)) {
      this.parameters.set(parameter.name, parameter);
    } else {
      const existedParam = this.parameters.get(parameter.name)!;
      // If node is already in our collection, ignore it.
      if (existedParam.nodes.includes(parameter.nodes[0])) return;

      existedParam.validators.push(...parameter.validators);
      existedParam.nodes.push(...parameter.nodes);
    }
  }
}
