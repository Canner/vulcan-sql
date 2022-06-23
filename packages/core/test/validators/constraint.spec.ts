import {
  Constraint,
  MinValueConstraint,
  RequiredConstraint,
} from '../../src/validators';

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
