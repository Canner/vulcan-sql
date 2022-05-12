import { Compiler, CompileResult } from '../compiler';
import * as nunjucks from 'nunjucks';
import {
  ErrorExtension,
  Executor,
  isFilterExtension,
  isTagExtension,
  NunjucksCompilerExtension,
  NunjucksFilterExtensionWrapper,
  NunjucksTagExtensionWrapper,
  ReqExtension,
} from './extensions';
import * as transformer from 'nunjucks/src/transformer';
import { walkAst } from './astWalker';
import { ParametersVisitor, ErrorsVisitor, FiltersVisitor } from './visitors';
import { UniqueExtension } from './extensions/filters';

export class NunjucksCompiler implements Compiler {
  public name = 'nunjucks';
  private env: nunjucks.Environment;
  private executor: Executor;

  constructor({
    loader,
    executor,
  }: {
    loader: nunjucks.ILoader;
    executor: Executor;
  }) {
    this.env = new nunjucks.Environment(loader);
    this.executor = executor;
    this.loadBuiltInExtensions();
  }

  public compile(template: string): CompileResult {
    const ast = nunjucks.parser.parse(template, this.env.extensionsList, {});
    const compiler = new nunjucks.compiler.Compiler(
      'main',
      this.env.opts.throwOnUndefined || false
    );
    const metadata = this.getMetadata(ast);
    const preProcessedAst = this.preProcess(ast);
    compiler.compile(preProcessedAst);
    const code = compiler.getCode();
    return { compiledData: `(() => {${code}})()`, metadata };
  }

  public async render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.env.render(templateName, data, (err, res) => {
        if (err) return reject(err);
        if (!res) return resolve('');
        else
          return resolve(
            res
              .split(/\r?\n/)
              .filter((line) => line.trim().length > 0)
              .join('\n')
          );
      });
    });
  }

  public loadExtension(extension: NunjucksCompilerExtension): void {
    if (isTagExtension(extension)) {
      const { name, transform } = NunjucksTagExtensionWrapper(extension);
      this.env.addExtension(name, transform);
    } else if (isFilterExtension(extension)) {
      const { name, transform } = NunjucksFilterExtensionWrapper(extension);
      this.env.addFilter(name, transform);
    } else {
      throw new Error('Unsupported extension');
    }
  }

  private loadBuiltInExtensions(): void {
    this.loadExtension(new ErrorExtension());
    this.loadExtension(new UniqueExtension());
    this.loadExtension(new ReqExtension({ executor: this.executor }));
  }

  private getMetadata(ast: nunjucks.nodes.Node) {
    const parameters = new ParametersVisitor();
    const errors = new ErrorsVisitor();
    const filters = new FiltersVisitor({ env: this.env });
    walkAst(ast, [parameters, errors, filters]);
    return {
      parameters: parameters.getParameters(),
      errors: errors.getErrors(),
    };
  }

  private preProcess(ast: nunjucks.nodes.Node): nunjucks.nodes.Node {
    return transformer.transform(ast, []);
  }
}
