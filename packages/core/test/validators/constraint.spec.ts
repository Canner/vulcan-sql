import {
  Constraint,
  EnumConstraint,
  MaxLengthConstraint,
  MaxValueConstraint,
  MinLengthConstraint,
  MinValueConstraint,
  RequiredConstraint,
} from '@vulcan/core/validators';

it('Required constraint compose should always return required constraint', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.Required();
  const constraint2 = Constraint.Required();
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof RequiredConstraint).toBeTruthy();
});

it('MinValue constraint compose should maximum the value', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.MinValue(1);
  const constraint2 = Constraint.MinValue(2);
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof MinValueConstraint).toBeTruthy();
  expect((composed as MinValueConstraint).getMinValue()).toBe(2);
});

it('MaxValue constraint compose should minimize the value', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.MaxValue(1);
  const constraint2 = Constraint.MaxValue(2);
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof MaxValueConstraint).toBeTruthy();
  expect((composed as MaxValueConstraint).getMaxValue()).toBe(1);
});

it('MinLength constraint compose should maximum the value', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.MinLength(1);
  const constraint2 = Constraint.MinLength(2);
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof MinLengthConstraint).toBeTruthy();
  expect((composed as MinLengthConstraint).getMinLength()).toBe(2);
});

it('MaxLength constraint compose should minimize the value', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.MaxLength(1);
  const constraint2 = Constraint.MaxLength(2);
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof MaxLengthConstraint).toBeTruthy();
  expect((composed as MaxLengthConstraint).getMaxLength()).toBe(1);
});

it('RegexConstraint constraint compose should throw error', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.Regex('someExp');
  const constraint2 = Constraint.Regex('someExp');
  // Act, Arrange
  expect(() => constraint1.compose(constraint2)).toThrow();
});

it('Enum constraint compose should return the intersection of them', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.Enum([1, 2, 3, 4, 5]);
  const constraint2 = Constraint.Enum([3, 4, 5, 6, 7]);
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof EnumConstraint).toBeTruthy();
  expect((composed as EnumConstraint).getList()).toEqual([3, 4, 5]);
});
