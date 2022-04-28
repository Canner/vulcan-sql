import { Compiler } from './compilers';

export class TemplateEngine {
  private compiler: Compiler;

  constructor({ compiler }: { compiler: Compiler }) {
    this.compiler = compiler;
  }

  // public async compile(templateProvider) {}
}
