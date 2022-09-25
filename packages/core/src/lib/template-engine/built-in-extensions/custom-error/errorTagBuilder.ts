import * as nunjucks from 'nunjucks';
import { chain } from 'lodash';
import { METADATA_NAME } from './constants';
import { TagBuilder, VulcanInternalExtension } from '@vulcan-sql/core/models';
import { TemplateError } from '../../../utils/errors';

interface ErrorCode {
  code: string;
  lineNo: number;
  columnNo: number;
}

@VulcanInternalExtension()
export class ErrorTagBuilder extends TagBuilder {
  public tags = ['error'];
  public override metadataName = METADATA_NAME;
  private errorCodes: ErrorCode[] = [];

  public parse(parser: nunjucks.parser.Parser, nodes: typeof nunjucks.nodes) {
    // get the tag token
    const token = parser.nextToken();

    const errorMessage = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    // Add some fake nodes to the AST to indicate error position
    errorMessage.addChild(
      new nodes.Literal(token.lineno, token.colno, token.lineno)
    );
    errorMessage.addChild(
      new nodes.Literal(token.lineno, token.colno, token.colno)
    );

    return this.createAsyncExtensionNode(errorMessage, []);
  }

  public override onVisit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.CallExtension) {
      if (node.extName !== this.getName()) return;

      const errorCodeNode = node.args.children[0];
      if (!(errorCodeNode instanceof nunjucks.nodes.Literal))
        throw new TemplateError(
          `Expected literal, got ${errorCodeNode.typename}`
        );

      this.errorCodes.push({
        code: errorCodeNode.value,
        lineNo: errorCodeNode.lineno,
        columnNo: errorCodeNode.colno,
      });
    }
  }

  public override getMetadata() {
    return {
      errorCodes: chain(this.errorCodes)
        .groupBy('code')
        .values()
        .map((errorCodes) => ({
          code: errorCodes[0].code,
          locations: errorCodes.map((errorCode) => ({
            lineNo: errorCode.lineNo,
            columnNo: errorCode.columnNo,
          })),
        }))
        .value(),
    };
  }
}
