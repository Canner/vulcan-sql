import { PrepareParameter } from '@vulcan-sql/core/models';

export class Parameterizer {
  private parameterIndex = 1;
  private sealed = false;
  // We MUST not use pure object here because we care about the order of the keys.
  // https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#description
  private idToValueMapping = new Map<string, any>();
  private valueToIdMapping = new Map<any, string>();
  private prepare: PrepareParameter;

  constructor(prepare: PrepareParameter) {
    this.prepare = prepare;
  }

  public async generateIdentifier(value: any): Promise<string> {
    if (this.sealed)
      throw new Error(
        `This parameterizer has been sealed, we might use the parameterizer from a wrong request scope.`
      );
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

  public seal() {
    this.sealed = true;
  }

  public getBinding() {
    return this.idToValueMapping;
  }
}
