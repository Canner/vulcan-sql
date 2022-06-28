import { Compiler } from '../compiler';
import * as nunjucks from 'nunjucks';

const precompileWrapper: nunjucks.PrecompileOptions['wrapper'] = (
  templates
) => {
  const template = templates[0].template;
  return `(() => {${template}})()`;
};

export class NunjucksCompiler implements Compiler {
  public name = 'nunjucks';
  private env: nunjucks.Environment;

  constructor({ loader }: { loader: nunjucks.ILoader }) {
    this.env = new nunjucks.Environment(loader);
  }

  public compile(template: string): string {
    return nunjucks.precompileString(template, {
      wrapper: precompileWrapper,
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
