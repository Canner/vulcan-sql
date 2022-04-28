export abstract class Compiler {
  abstract compile(template: string): string;
  abstract render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string>;
}
