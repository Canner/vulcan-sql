export enum TemplateProviderType {
  LocalFile = 'LocalFile',
}

export interface ITemplateEngineOptions {
  provider: TemplateProviderType;
  templatePath: string;
}
