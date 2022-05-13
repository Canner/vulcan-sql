import { Compiler, TemplateMetadata } from './compiler';
import { ErrorExtension, ReqExtension, UniqueExtension } from './extensions';
import { InMemoryCodeLoader } from './inMemoryCodeLoader';
import { NunjucksCompiler } from './nunjucksCompiler';
import { TemplateProvider } from './template-providers';

export type AllTemplateMetadata = Record<string, TemplateMetadata>;

export type AllTemplates = Record<string, string>;

export interface PreCompiledResult {
  templates: AllTemplates;
  metadata?: AllTemplateMetadata;
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
    const executor = {
      // TODO: replace with real executor
      executeQuery: async () => [],
    };
    const compiler = new NunjucksCompiler({
      loader,
      extensions: [
        new ErrorExtension(),
        new ReqExtension({ executor }),
        new UniqueExtension(),
      ],
    });
    return new TemplateEngine({ compiler, templateProvider });
  }

  public async compile(): Promise<Required<PreCompiledResult>> {
    if (!this.templateProvider) throw new Error('Template provider is not set');

    const templateResult: Record<string, string> = {};
    const metadataResult: Record<string, TemplateMetadata> = {};

    for await (const template of this.templateProvider.getTemplates()) {
      const { compiledData, metadata } = this.compiler.compile(
        template.statement
      );
      templateResult[template.name] = compiledData;
      metadataResult[template.name] = metadata;
    }

    return {
      templates: templateResult,
      metadata: metadataResult,
    };
  }

  public async render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string> {
    return this.compiler.render(templateName, data);
  }
}
