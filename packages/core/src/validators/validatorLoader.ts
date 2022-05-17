import { IValidator } from '.';

export interface ValidatorLoader {
  getLoader(name: string): IValidator;
}
