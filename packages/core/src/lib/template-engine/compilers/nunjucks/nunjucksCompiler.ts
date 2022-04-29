import { Compiler } from '../compiler';
import * as nunjucks from 'nunjucks';

const precomileWrapper: nunjucks.PrecompileOptions['wrapper'] = (templates) => {
  const template = templates[0].template;
  return `(() => {${template}})()`;
};

export class NunjucksCompiler extends Compiler {
  public name = 'nunjucks';
  private env: nunjucks.Environment;

  constructor({ loader }: { loader: nunjucks.ILoader }) {
    super();
    this.env = new nunjucks.Environment(loader);
  }

  public compile(template: string): string {
    return nunjucks.precompileString(template, {
      wrapper: precomileWrapper,
      name: 'main',
    });
  }

  public async render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string> {
    return this.env.render(templateName, data);
  }
}
