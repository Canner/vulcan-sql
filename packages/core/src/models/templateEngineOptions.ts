export enum TemplateProviderType {
  LocalFile = 'LocalFile',
}

export interface ITemplateEngineOptions {
  /** The provider that provides template content, it's only required when we want to compile projects. */
  provider?: TemplateProviderType | string;
  folderPath?: string;
  codeLoader?: string;
  [key: string]: any;
}
