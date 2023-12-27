import {
  Constraint,
  EnumConstraint,
  MaxLengthConstraint,
  MinLengthConstraint,
  RequiredConstraint,
} from '@vulcan-sql/api-layer/validators';

it('Required constraint compose should always return required constraint', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.Required();
  const constraint2 = Constraint.Required();
  // Act
  const composed = constraint1.compose(constraint2);
  // Arrange
  expect(composed instanceof RequiredConstraint).toBeTruthy();
});

it.each([
  [Constraint.MinValue(1), Constraint.MinValue(2), Constraint.MinValue(2)],
  [Constraint.MinValue(2), Constraint.MinValue(1), Constraint.MinValue(2)],
  [
    Constraint.MinValue(2, true),
    Constraint.MinValue(2, false),
    Constraint.MinValue(2, true),
  ],
  [
    Constraint.MinValue(2, false),
    Constraint.MinValue(2, true),
    Constraint.MinValue(2, true),
  ],
])(
  'MinValue constraint compose should maximum the value',
  async (
    constraint1: Constraint,
    constraint2: Constraint,
    expectedResult: Constraint
  ) => {
    // Act
    const composed = constraint1.compose(constraint2);
    // Arrange
    expect(composed).toEqual(expectedResult);
  }
);

it.each([
  [Constraint.MaxValue(1), Constraint.MaxValue(2), Constraint.MaxValue(1)],
  [Constraint.MaxValue(2), Constraint.MaxValue(1), Constraint.MaxValue(1)],
  [
    Constraint.MaxValue(2, true),
    Constraint.MaxValue(2, false),
    Constraint.MaxValue(2, true),
  ],
  [
    Constraint.MaxValue(2, false),
    Constraint.MaxValue(2, true),
    Constraint.MaxValue(2, true),
  ],
])(
  'MaxValue constraint compose should minimize the value',
  async (
    constraint1: Constraint,
    constraint2: Constraint,
    expectedResult: Constraint
  ) => {
    // Act
    const composed = constraint1.compose(constraint2);
    // Arrange
    expect(composed).toEqual(expectedResult);
  }
);

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
  // Act, Assert
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

it('TypeConstraint constraint compose should throw error', async () => {
  // Arrange
  const constraint1: Constraint = Constraint.Type('string');
  const constraint2 = Constraint.Type('number');
  // Act, Assert
  expect(() => constraint1.compose(constraint2)).toThrow();
});
