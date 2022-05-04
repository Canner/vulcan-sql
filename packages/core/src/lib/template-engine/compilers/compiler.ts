export interface Compiler {
  name: string;
  compile(template: string): string;
  render<T extends object>(templateName: string, data: T): Promise<string>;
}
