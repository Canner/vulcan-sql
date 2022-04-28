export interface Template {
  name: string;
  statement: string;
}

export interface TemplateProvider {
  getTemplates(): AsyncGenerator<Template>;
}
