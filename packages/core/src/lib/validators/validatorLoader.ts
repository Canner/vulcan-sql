import IValidator from './validator';

export interface ValidatorLoader {
  getLoader(name: string): IValidator;
}
