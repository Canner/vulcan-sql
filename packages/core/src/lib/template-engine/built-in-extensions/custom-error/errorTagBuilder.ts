import {
  OnAstVisit,
  ProvideMetadata,
  TagBuilder,
} from '../../extension-loader';
import * as nunjucks from 'nunjucks';
import { chain } from 'lodash';
import { METADATA_NAME } from './constants';

interface ErrorCode {
  code: string;
  lineNo: number;
  columnNo: number;
}

export class ErrorTagBuilder
  extends TagBuilder
  implements OnAstVisit, ProvideMetadata
{
  public tags = ['error'];
  private errorCodes: ErrorCode[] = [];
  public metadataName = METADATA_NAME;

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

  public onVisit(node: nunjucks.nodes.Node) {
    if (node instanceof nunjucks.nodes.CallExtension) {
      if (node.extName !== this.getName()) return;

      const errorCodeNode = node.args.children[0];
      if (!(errorCodeNode instanceof nunjucks.nodes.Literal))
        throw new Error(`Expected literal, got ${errorCodeNode.typename}`);

      this.errorCodes.push({
        code: errorCodeNode.value,
        lineNo: errorCodeNode.lineno,
        columnNo: errorCodeNode.colno,
      });
    }
  }

  public getMetadata() {
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
