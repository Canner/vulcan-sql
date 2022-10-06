import { intersection } from 'lodash';
import { InternalError } from '../utils';

export abstract class Constraint {
  static Required() {
    return new RequiredConstraint();
  }

  static MinValue(minValue: number, exclusive?: boolean) {
    return new MinValueConstraint(minValue, exclusive);
  }

  static MaxValue(maxValue: number, exclusive?: boolean) {
    return new MaxValueConstraint(maxValue, exclusive);
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

  static Type(type: TypeConstraintType) {
    return new TypeConstraint(type);
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
  constructor(private minValue: number, private exclusive = false) {
    super();
  }

  public getMinValue() {
    return this.minValue;
  }

  public isExclusive() {
    return this.exclusive;
  }

  public compose(constraint: MinValueConstraint): MinValueConstraint {
    if (constraint.getMinValue() === this.getMinValue()) {
      return new MinValueConstraint(
        this.getMinValue(),
        constraint.isExclusive() || this.isExclusive()
      );
    }
    if (constraint.getMinValue() > this.getMinValue()) {
      return constraint;
    }
    return this;
  }
}

export class MaxValueConstraint extends Constraint {
  constructor(private maxValue: number, private exclusive = false) {
    super();
  }

  public getMaxValue() {
    return this.maxValue;
  }

  public isExclusive() {
    return this.exclusive;
  }

  public compose(constraint: MaxValueConstraint): MaxValueConstraint {
    if (constraint.getMaxValue() === this.getMaxValue()) {
      return new MaxValueConstraint(
        this.getMaxValue(),
        constraint.isExclusive() || this.isExclusive()
      );
    }
    if (constraint.getMaxValue() < this.getMaxValue()) {
      return constraint;
    }
    return this;
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
      `Cannot use multiple RegexConstraint at the same time.`
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

export type TypeConstraintType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object';

export class TypeConstraint extends Constraint {
  constructor(private type: TypeConstraintType) {
    super();
  }

  public getType() {
    return this.type;
  }

  public compose(): TypeConstraint {
    throw new InternalError(
      `Cannot use multiple TypeConstraint at the same time.`
    );
  }
}
