import { chain } from 'lodash';
import * as nunjucks from 'nunjucks';
import { TemplateErrorMetadata } from '../../compiler';
import { Visitor } from './visitor';

interface ErrorCode {
  code: string;
  lineNo: number;
  columnNo: number;
}

export class ErrorsVisitor implements Visitor {
  private extensionName: string;
  private errorCodes: ErrorCode[] = [];

  constructor({
    extensionName = 'built-in-error',
  }: { extensionName?: string } = {}) {
    this.extensionName = extensionName;
  }

  public visit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.CallExtension) {
      if (node.extName !== this.extensionName) return;
      const errorCodeNode = node.args.children[0];
      if (!(errorCodeNode instanceof nunjucks.nodes.Literal))
        throw new Error(
          `Expected literal, got ${errorCodeNode.constructor.name}`
        );
      this.errorCodes.push({
        code: errorCodeNode.value,
        lineNo: errorCodeNode.lineno,
        columnNo: errorCodeNode.colno,
      });
    }
  }

  public reset() {
    this.errorCodes = [];
  }

  public getErrors(): TemplateErrorMetadata[] {
    return chain(this.errorCodes)
      .groupBy('code')
      .values()
      .map((errorCodes) => ({
        code: errorCodes[0].code,
        locations: errorCodes.map((errorCode) => ({
          lineNo: errorCode.lineNo,
          columnNo: errorCode.columnNo,
        })),
      }))
      .value();
  }
}
