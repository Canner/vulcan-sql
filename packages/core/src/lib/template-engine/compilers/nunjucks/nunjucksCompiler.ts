import { Compiler } from '../compiler';
import * as nunjucks from 'nunjucks';
import {
  ErrorExtension,
  isTagExtension,
  NunjucksCompilerExtension,
} from './extensions';

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
    this.loadBuiltInExtensions();
  }

  public compile(template: string): string {
    return nunjucks.precompileString(template, {
      wrapper: precompileWrapper,
      name: 'main',
      env: this.env,
    });
  }

  public async render<T extends object>(
    templateName: string,
    data: T
  ): Promise<string> {
    return this.env.render(templateName, data);
  }

  public loadExtension(extension: NunjucksCompilerExtension): void {
    if (isTagExtension(extension)) {
      this.env.addExtension(extension.name, extension);
    } else {
      throw new Error('Unsupported extension');
    }
  }

  private loadBuiltInExtensions(): void {
    this.loadExtension(new ErrorExtension());
  }
}
