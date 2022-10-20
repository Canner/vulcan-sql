import { RequestParameter } from '@vulcan-sql/core/models';

type PrepareParameterFuncWithoutProfile = {
  (param: Omit<RequestParameter, 'profileName'>): Promise<string>;
};

export interface IParameterizer {
  generateIdentifier(value: any): Promise<string>;
  reset(): void;
  getBinding(): Map<string, any>;
  clone(): IParameterizer;
}

export class Parameterizer implements IParameterizer {
  private startedIndex = 1;
  private parameterIndex = 1;
  // We MUST not use pure object here because we care about the order of the keys.
  // https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#description
  private idToValueMapping = new Map<string, any>();
  private valueToIdMapping = new Map<any, string>();
  private prepare: PrepareParameterFuncWithoutProfile;

  constructor(prepare: PrepareParameterFuncWithoutProfile, startedIndex = 1) {
    this.prepare = prepare;
    this.startedIndex = startedIndex;
    this.parameterIndex = startedIndex;
  }

  public async generateIdentifier(value: any): Promise<string> {
    if (this.valueToIdMapping.has(value))
      return this.valueToIdMapping.get(value)!;
    const id = await this.prepare({
      parameterIndex: this.parameterIndex++,
      value,
    });
    this.idToValueMapping.set(id, value);
    this.valueToIdMapping.set(value, id);
    return id;
  }

  public getBinding() {
    return this.idToValueMapping;
  }

  public clone(): IParameterizer {
    return new Parameterizer(this.prepare, this.parameterIndex + 1);
  }

  public reset() {
    this.parameterIndex = this.startedIndex;
  }
}
