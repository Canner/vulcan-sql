import { Compiler, InMemoryCodeLoader, NunjucksCompiler } from './compilers';
import { TemplateProvider } from './template-providers';

export interface PreCompiledResult {
  templates: Record<string, string>;
}

export class TemplateEngine {
  private compiler: Compiler;
  private templateProvider?: TemplateProvider;

  constructor({
    compiler,
    templateProvider,
  }: {
    compiler: Compiler;
    templateProvider?: TemplateProvider;
  }) {
    this.compiler = compiler;
    this.templateProvider = templateProvider;
  }

  public static useDefaultLoader({
    compiledResult,
    templateProvider,
  }: {
    compiledResult?: PreCompiledResult;
    templateProvider?: TemplateProvider;
  } = {}): TemplateEngine {
    const loader = new InMemoryCodeLoader();
    // Put compiled templates into loader
    if (compiledResult) {
      Object.keys(compiledResult.templates).forEach((templateName) => {
        loader.setSource(templateName, compiledResult.templates[templateName]);
      });
    }
    const compiler = new NunjucksCompiler({ loader });
    return new TemplateEngine({ compiler, templateProvider });
  }

  public async compile(): Promise<PreCompiledResult> {
    if (!this.templateProvider) throw new Error('Template provider is not set');

    const templateResult: Record<string, string> = {};

    for await (const template of this.templateProvider.getTemplates()) {
      templateResult[template.name] = this.compiler.compile(template.statement);
    }

    return {
      templates: templateResult,
    };
  }

  public async render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string> {
    return this.compiler.render(templateName, data);
  }
}
