import { Compiler, TemplateMetadata } from './compiler';
import { TemplateProvider } from './template-providers';
import { injectable, inject, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/core/containers';
import { TemplateEngineOptions } from '../../options';

export type AllTemplateMetadata = Record<string, TemplateMetadata>;

export type AllTemplates = Record<string, string>;

export interface PreCompiledResult {
  templates: AllTemplates;
  metadata?: AllTemplateMetadata;
}

@injectable()
export class TemplateEngine {
  private compiler: Compiler;
  private templateProvider: TemplateProvider;

  constructor(
    @inject(TYPES.Compiler) compiler: Compiler,
    @inject(TYPES.Factory_TemplateProvider)
    templateProviderFactory: interfaces.AutoNamedFactory<TemplateProvider>,
    @inject(TYPES.TemplateEngineOptions) options: TemplateEngineOptions
  ) {
    this.compiler = compiler;
    this.templateProvider = templateProviderFactory(options.provider);
  }

  public async compile(): Promise<Required<PreCompiledResult>> {
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

  public async execute<T extends object>(
    templateName: string,
    data: T
  ): Promise<any> {
    return this.compiler.execute(templateName, data);
  }
}
