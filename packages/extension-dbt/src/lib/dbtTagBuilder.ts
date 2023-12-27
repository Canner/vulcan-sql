import { TagBuilder } from '@vulcan-sql/api-layer';
import * as nunjucks from 'nunjucks';
import { promises as fs } from 'fs';
import { chain } from 'lodash';
import { DBTExtensionOptions } from './model';

export class DBTTagBuilder extends TagBuilder<DBTExtensionOptions> {
  public tags = ['dbt'];
  private models = new Map<string, string>();

  public override async onActivate() {
    this.models.clear();
    const modelFiles = this.getConfig()?.modelFiles || [];
    for (const modelFile of modelFiles) {
      const content = JSON.parse(await fs.readFile(modelFile, 'utf-8'));
      chain(content.nodes || [])
        .toPairs()
        .filter((node) => node[0].startsWith('model'))
        .forEach((node) => this.loadModel(node[0], node[1]))
        .value();
    }
  }

  public parse(
    parser: nunjucks.parser.Parser,
    nodes: typeof nunjucks.nodes,
    lexer: typeof nunjucks.lexer
  ) {
    // {% dbt "model-name" %}
    // consume dbt tag
    const dbtToken = parser.nextToken();
    const args = new nodes.NodeList(dbtToken.lineno, dbtToken.colno);
    const modelNameToken = parser.nextToken();
    if (modelNameToken.type !== lexer.TOKEN_STRING) {
      parser.fail(
        `Expect model name as string, but got ${modelNameToken.type}`,
        modelNameToken.lineno,
        modelNameToken.colno
      );
    }
    const end = parser.nextToken();
    if (end.type !== lexer.TOKEN_BLOCK_END) {
      parser.fail(
        `Expect block end %}, but got ${end.type}`,
        end.lineno,
        end.colno
      );
    }

    const sql = this.models.get(modelNameToken.value);
    if (!sql) {
      parser.fail(
        `Model ${modelNameToken.value} is not found in modelFiles`,
        modelNameToken.lineno,
        modelNameToken.colno
      );
    }

    const output = new nodes.Output(dbtToken.lineno, dbtToken.colno);
    output.addChild(
      new nodes.TemplateData(dbtToken.lineno, dbtToken.colno, sql)
    );
    return this.createAsyncExtensionNode(args, [output]);
  }

  private loadModel(name: string, node: any) {
    if (this.models.has(name)) throw Error(`Model name ${name} is unambiguous`);
    // If the materialization of a table is view, table, or incremental, the "relation_name" property indicates the table name created by dbt.
    // If it is an ephemeral model, the "relation_name" property is null, we should use compiled sql instead.
    this.models.set(name, node.relation_name || `(${node.compiled_sql})`);
  }
}
