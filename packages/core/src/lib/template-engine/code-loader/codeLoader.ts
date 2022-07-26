import * as nunjucks from 'nunjucks';

export interface ICodeLoader {
  setSource(name: string, code: string): void;
  getSource(name: string): nunjucks.LoaderSource | null;
}
