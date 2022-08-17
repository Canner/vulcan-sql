export enum TemplateProviderType {
  LocalFile = 'LocalFile',
}

export interface ITemplateEngineOptions {
  provider?: TemplateProviderType | string;
  folderPath?: string;
  codeLoader?: string;
  [key: string]: any;
}
