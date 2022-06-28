export interface Compiler {
  name: string;
  /**
   * Turn the template to compiled data. In most cases, we compile the template to some JavaScript code in order to "execute" them later.
   * @param template The path or identifier of a template source
   */
  compile(template: string): string;
  render<T extends object>(templateName: string, data: T): Promise<string>;
}
