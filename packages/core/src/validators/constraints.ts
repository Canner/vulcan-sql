export abstract class Constraint {
  static Required() {
    return new RequiredConstraint();
  }

  static MinValue(minValue: number) {
    return new MinValueConstraint(minValue);
  }

  abstract compose(constraint: Constraint): Constraint;
}

export class RequiredConstraint extends Constraint {
  public compose() {
    // No matter what other required constraint is, we always return a required constraint
    return new RequiredConstraint();
  }
}

export class MinValueConstraint extends Constraint {
  constructor(private minValue: number) {
    super();
  }

  public getMinValue() {
    return this.minValue;
  }

  public compose(constraint: MinValueConstraint): MinValueConstraint {
    return new MinValueConstraint(
      Math.max(this.minValue, constraint.getMinValue())
    );
  }
}
