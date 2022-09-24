import { intersection } from 'lodash';
import { InternalError } from '../utils';

export abstract class Constraint {
  static Required() {
    return new RequiredConstraint();
  }

  static MinValue(minValue: number) {
    return new MinValueConstraint(minValue);
  }

  static MaxValue(maxValue: number) {
    return new MaxValueConstraint(maxValue);
  }

  static MinLength(minLength: number) {
    return new MinLengthConstraint(minLength);
  }

  static MaxLength(maxLength: number) {
    return new MaxLengthConstraint(maxLength);
  }

  static Regex(regex: string) {
    return new RegexConstraint(regex);
  }

  static Enum<T = any>(list: Array<T>) {
    return new EnumConstraint(list);
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

export class MaxValueConstraint extends Constraint {
  constructor(private maxValue: number) {
    super();
  }

  public getMaxValue() {
    return this.maxValue;
  }

  public compose(constraint: MaxValueConstraint): MaxValueConstraint {
    return new MaxValueConstraint(
      Math.min(this.maxValue, constraint.getMaxValue())
    );
  }
}

export class MinLengthConstraint extends Constraint {
  constructor(private minLength: number) {
    super();
  }

  public getMinLength() {
    return this.minLength;
  }

  public compose(constraint: MinLengthConstraint): MinLengthConstraint {
    return new MinLengthConstraint(
      Math.max(this.minLength, constraint.getMinLength())
    );
  }
}

export class MaxLengthConstraint extends Constraint {
  constructor(private maxLength: number) {
    super();
  }

  public getMaxLength() {
    return this.maxLength;
  }

  public compose(constraint: MaxLengthConstraint): MaxLengthConstraint {
    return new MaxLengthConstraint(
      Math.min(this.maxLength, constraint.getMaxLength())
    );
  }
}

export class RegexConstraint extends Constraint {
  constructor(private regex: string) {
    super();
  }

  public getRegex() {
    return this.regex;
  }

  public compose(): RegexConstraint {
    throw new InternalError(
      `Can use multiple RegexConstraint at the same time.`
    );
  }
}

export class EnumConstraint<T = string> extends Constraint {
  constructor(private list: Array<T>) {
    super();
  }

  public getList() {
    return this.list;
  }

  public compose(constraint: EnumConstraint<any>): EnumConstraint {
    return new EnumConstraint<any>(
      intersection(this.getList(), constraint.getList())
    );
  }
}
