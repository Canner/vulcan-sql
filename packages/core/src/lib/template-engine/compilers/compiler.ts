export interface TemplateLocation {
  lineNo: number;
  columnNo: number;
}

export interface TemplateErrorMetadata {
  code: string;
  locations: TemplateLocation[];
}

export interface TemplateParameterMetadata {
  name: string;
  locations: TemplateLocation[];
}

export interface TemplateMetadata {
  parameters: TemplateParameterMetadata[];
  errors: TemplateErrorMetadata[];
}

export interface CompileResult {
  compiledData: string;
  metadata: TemplateMetadata;
}

export interface Compiler {
  name: string;
  compile(template: string): CompileResult;
  render<T extends object>(templateName: string, data: T): Promise<string>;
}
