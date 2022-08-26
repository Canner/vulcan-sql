import { Parameterizer } from './parameterizer';

export class TemplateInput {
  private rawValue: any;

  constructor(rawValue: any) {
    this.rawValue = rawValue;
  }

  public raw() {
    return this.rawValue;
  }

  public parameterize(parameterizer: Parameterizer) {
    return parameterizer.generateIdentifier(this.rawValue);
  }
}
