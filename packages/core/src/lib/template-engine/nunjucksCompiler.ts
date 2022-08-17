import { Compiler, CompileResult } from './compiler';
import * as nunjucks from 'nunjucks';
import * as transformer from 'nunjucks/src/transformer';
import { inject, injectable, multiInject, named, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  generateMetadata,
  implementedOnAstVisit,
  implementedProvideMetadata,
  OnAstVisit,
  ProvideMetadata,
  walkAst,
} from './extension-utils';
import { IDataQueryBuilder } from '../data-query';
import {
  Pagination,
  TemplateEngineExtension,
  RuntimeExtension,
  CompileTimeExtension,
  TagBuilder,
  TagRunner,
  FilterBuilder,
  FilterRunner,
} from '@vulcan-sql/core/models';

@injectable()
export class NunjucksCompiler implements Compiler {
  public name = 'nunjucks';
  private runtimeEnv: nunjucks.Environment;
  private compileTimeEnv: nunjucks.Environment;
  private extensions: TemplateEngineExtension[];
  private astVisitors: OnAstVisit[] = [];
  private metadataProviders: ProvideMetadata[] = [];
  private extensionsInitialized = false;

  constructor(
    @multiInject(TYPES.Extension_TemplateEngine)
    @optional()
    extensions: TemplateEngineExtension[] = [],
    @inject(TYPES.CompilerEnvironment)
    @named('runtime')
    runtimeEnv: nunjucks.Environment,
    @inject(TYPES.CompilerEnvironment)
    @named('compileTime')
    compileTimeEnv: nunjucks.Environment
  ) {
    this.runtimeEnv = runtimeEnv;
    this.compileTimeEnv = compileTimeEnv;
    this.extensions = extensions;
    this.loadAllExtensions();
  }

  public async compile(template: string): Promise<CompileResult> {
    await this.initializeExtensions();
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
    this.traverseAst(ast);
    const metadata = this.getMetadata();
    const preProcessedAst = this.preProcess(ast);
    return { ast: preProcessedAst, metadata };
  }

  public async execute<T extends object>(
    templateName: string,
    data: T,
    pagination?: Pagination
  ): Promise<any> {
    await this.initializeExtensions();
    const builder = await this.renderAndGetMainBuilder(templateName, data);
    if (pagination) builder.paginate(pagination);
    return builder.value();
  }

  public loadExtension(extension: TemplateEngineExtension): void {
    if (extension instanceof RuntimeExtension) {
      this.loadRuntimeExtensions(extension);
    } else if (extension instanceof CompileTimeExtension) {
      this.loadCompileTimeExtensions(extension);
    } else {
      throw new Error(
        `Extension must be of type RuntimeExtension or CompileTimeExtension`
      );
    }
  }

  private loadAllExtensions(): void {
    this.extensions.forEach((ext) => this.loadExtension(ext));
  }

  private loadCompileTimeExtensions(extension: CompileTimeExtension): void {
    // Extends
    if (extension instanceof TagBuilder) {
      this.compileTimeEnv.addExtension(extension.getName(), extension);
    } else if (extension instanceof FilterBuilder) {
      this.compileTimeEnv.addFilter(
        extension.filterName,
        () => {}, // We don't need to implement transform function in compile time
        true
      );
    }
    // Implement
    if (implementedOnAstVisit(extension)) {
      this.astVisitors.push(extension);
    }
    if (implementedProvideMetadata(extension)) {
      this.metadataProviders.push(extension);
    }
  }

  private loadRuntimeExtensions(extension: RuntimeExtension): void {
    if (extension instanceof TagRunner) {
      this.runtimeEnv.addExtension(extension.getName(), extension);
    } else if (extension instanceof FilterRunner) {
      this.runtimeEnv.addFilter(
        extension.filterName,
        extension.__transform.bind(extension),
        true
      );
    }
  }

  private traverseAst(ast: nunjucks.nodes.Node) {
    walkAst(ast, this.astVisitors);
  }

  /** Get some metadata from the AST tree, e.g. the errors defined by templates.
   * It'll help use to validate templates, validate schema ...etc. */
  private getMetadata() {
    return generateMetadata(this.metadataProviders);
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

  private async initializeExtensions() {
    if (this.extensionsInitialized) return;
    for (const extension of this.extensions) {
      if (extension.activate) await extension.activate();
    }
    this.extensionsInitialized = true;
  }
}
