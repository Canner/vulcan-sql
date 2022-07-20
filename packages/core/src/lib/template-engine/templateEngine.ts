import { Compiler, TemplateMetadata } from './compiler';
import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  CodeLoader,
  Pagination,
  PreparedQueryParams,
  TemplateProvider,
} from '@vulcan-sql/core/models';
import { get, omit } from 'lodash';

export type AllTemplateMetadata = Record<string, TemplateMetadata>;

export type AllTemplates = Record<string, string>;

export interface PreCompiledResult {
  templates: AllTemplates;
  metadata?: AllTemplateMetadata;
}

@injectable()
export class TemplateEngine {
  private compiler: Compiler;
  private templateProvider?: TemplateProvider;
  private compilerLoader: CodeLoader;

  constructor(
    @inject(TYPES.Compiler) compiler: Compiler,
    @inject(TYPES.TemplateProvider)
    @optional()
    templateProvider: TemplateProvider | undefined,
    @inject(TYPES.CompilerLoader) compilerLoader: CodeLoader
  ) {
    this.compiler = compiler;
    this.compilerLoader = compilerLoader;
    if (templateProvider) this.templateProvider = templateProvider;
  }

  public async compile(): Promise<Required<PreCompiledResult>> {
    if (!this.templateProvider)
      throw new Error('Template provider has not been initialized.');

    await this.templateProvider!.activate?.();

    const templateResult: Record<string, string> = {};
    const metadataResult: Record<string, TemplateMetadata> = {};

    for await (const template of this.templateProvider.getTemplates()) {
      const { compiledData, metadata } = await this.compiler.compile(
        template.statement
      );
      // load compileData immediately to the loader
      this.compilerLoader.setSource(template.name, compiledData);
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
    data: T,
    pagination?: Pagination
  ): Promise<any> {
    const others = omit(data, '_prepared');
    const prepared: PreparedQueryParams | undefined = get(data, '_prepared');
    // wrap to context object
    return this.compiler.execute(
      templateName,
      {
        context: {
          ...others,
          ['params']: prepared?.identifiers || {},
          ['_paramBinds']: prepared?.binds || {},
        },
      },
      pagination
    );
  }
}
