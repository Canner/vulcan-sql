import { Compiler, CompileResult } from './compiler';
import * as nunjucks from 'nunjucks';
import {
  isFilterExtension,
  isTagExtension,
  NunjucksCompilerExtension,
  NunjucksFilterExtensionWrapper,
  NunjucksTagExtensionWrapper,
  QueryBuilder,
} from './extensions';
import * as transformer from 'nunjucks/src/transformer';
import { walkAst } from './visitors/astWalker';
import {
  ParametersVisitor,
  ErrorsVisitor,
  FiltersVisitor,
  BuilderValueVisitor,
  MainBuilderVisitor,
} from './visitors';
import { inject, injectable, multiInject, optional } from 'inversify';
import { TYPES } from '@vulcan/core/containers';

@injectable()
export class NunjucksCompiler implements Compiler {
  public name = 'nunjucks';
  private env: nunjucks.Environment;
  private extensions: NunjucksCompilerExtension[];

  constructor(
    @inject(TYPES.CompilerLoader) loader: nunjucks.ILoader,
    @multiInject(TYPES.CompilerExtension)
    @optional()
    extensions: NunjucksCompilerExtension[] = []
  ) {
    this.env = new nunjucks.Environment(loader);
    this.extensions = extensions;
    this.loadAllExtensions();
  }

  public compile(template: string): CompileResult {
    const compiler = new nunjucks.compiler.Compiler(
      'main',
      this.env.opts.throwOnUndefined || false
    );
    const { ast, metadata } = this.generateAst(template);
    compiler.compile(ast);
    const code = compiler.getCode();
    return { compiledData: `(() => {${code}})()`, metadata };
  }

  public generateAst(template: string) {
    const ast = nunjucks.parser.parse(template, this.env.extensionsList, {});
    const metadata = this.getMetadata(ast);
    const preProcessedAst = this.preProcess(ast);
    return { ast: preProcessedAst, metadata };
  }

  public async execute<T extends object>(
    templateName: string,
    data: T
  ): Promise<any> {
    const builder = await this.renderAndGetMainBuilder(templateName, data);
    return builder.value();
  }

  public loadExtension(extension: NunjucksCompilerExtension): void {
    if (isTagExtension(extension)) {
      const { name, transform } = NunjucksTagExtensionWrapper(extension);
      this.env.addExtension(name, transform);
    } else if (isFilterExtension(extension)) {
      const { name, transform } = NunjucksFilterExtensionWrapper(extension);
      this.env.addFilter(name, transform, true);
    } else {
      throw new Error('Unsupported extension');
    }
  }

  private loadAllExtensions(): void {
    this.extensions.forEach((ext) => this.loadExtension(ext));
  }

  /** Get some metadata from the AST tree, e.g. the errors defined by templates.
   * It'll help use to validate templates, validate schema ...etc. */
  private getMetadata(ast: nunjucks.nodes.Node) {
    const parameters = new ParametersVisitor();
    const errors = new ErrorsVisitor();
    const filters = new FiltersVisitor({ env: this.env });
    const builderValueVisitor = new BuilderValueVisitor();
    const mainBuilderVisitor = new MainBuilderVisitor();
    walkAst(ast, [
      parameters,
      errors,
      filters,
      builderValueVisitor,
      mainBuilderVisitor,
    ]);
    return {
      parameters: parameters.getParameters(),
      errors: errors.getErrors(),
    };
  }

  /** Process the AST tree before compiling */
  private preProcess(ast: nunjucks.nodes.Node): nunjucks.nodes.Node {
    // Nunjucks'll handle the async filter via pre-process functions
    return transformer.transform(ast, this.env.asyncFilters);
  }

  private renderAndGetMainBuilder(templateName: string, data: any) {
    const template = this.env.getTemplate(templateName, true);
    return new Promise<QueryBuilder>((resolve, reject) => {
      template.getExported<{ FINAL_BUILDER: QueryBuilder }>(
        data,
        (err, res) => {
          if (err) return reject(err);
          else resolve(res.FINAL_BUILDER);
        }
      );
    });
  }
}
