import { Compiler, CompileResult, ExecuteContext } from './compiler';
import * as nunjucks from 'nunjucks';
import * as transformer from 'nunjucks/src/transformer';
import { inject, injectable, named } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { IDataQueryBuilder } from '../data-query';
import { Pagination, DataResult } from '@vulcan-sql/api-layer/models';
import { NunjucksExecutionMetadata } from './nunjucksExecutionMetadata';
import {
  BuildTimeCompilerEnvironment,
  RuntimeCompilerEnvironment,
} from './compiler-environment';

@injectable()
export class NunjucksCompiler implements Compiler {
  public name = 'nunjucks';
  private runtimeEnv: RuntimeCompilerEnvironment;
  private compileTimeEnv: BuildTimeCompilerEnvironment;

  constructor(
    @inject(TYPES.CompilerEnvironment)
    @named('runtime')
    runtimeEnv: RuntimeCompilerEnvironment,
    @inject(TYPES.CompilerEnvironment)
    @named('compileTime')
    compileTimeEnv: BuildTimeCompilerEnvironment
  ) {
    this.runtimeEnv = runtimeEnv;
    this.compileTimeEnv = compileTimeEnv;
  }

  public async compile(template: string): Promise<CompileResult> {
    await this.compileTimeEnv.initializeExtensions();
    const compiler = new nunjucks.compiler.Compiler(
      'main',
      this.compileTimeEnv.opts.throwOnUndefined || false
    );
    const { ast, metadata } = this.generateAst(template);
    compiler.compile(ast);
    const code = compiler.getCode();
    return { compiledData: `(() => {${code}})()`, metadata };
  }

  public generateAst(template: string) {
    const ast = nunjucks.parser.parse(
      template,
      this.compileTimeEnv.extensionsList,
      {}
    );
    this.compileTimeEnv.traverseAst(ast);
    const metadata = this.compileTimeEnv.getMetadata();
    const preProcessedAst = this.preProcess(ast);
    return { ast: preProcessedAst, metadata };
  }

  public async execute(
    templateName: string,
    data: ExecuteContext,
    pagination?: Pagination
  ): Promise<DataResult> {
    await this.runtimeEnv.initializeExtensions();
    const metadata = new NunjucksExecutionMetadata(data);
    const builder = await this.renderAndGetMainBuilder(
      templateName,
      metadata.dump()
    );
    if (pagination) builder.paginate(pagination);
    return builder.value();
  }

  /** Process the AST tree before compiling */
  private preProcess(ast: nunjucks.nodes.Node): nunjucks.nodes.Node {
    // Nunjucks'll handle the async filter via pre-process functions
    return transformer.transform(ast, this.compileTimeEnv.asyncFilters);
  }

  private renderAndGetMainBuilder(templateName: string, data: any) {
    const template = this.runtimeEnv.getTemplate(templateName, true);
    return new Promise<IDataQueryBuilder>((resolve, reject) => {
      template.getExported<{ FINAL_BUILDER: IDataQueryBuilder }>(
        data,
        (err, res) => {
          if (err) return reject(err);
          else resolve(res.FINAL_BUILDER);
        }
      );
    });
  }
}
