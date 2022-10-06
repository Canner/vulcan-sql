import { Constraint, IntegerTypeValidator } from '@vulcan-sql/core/validators';

describe('Test "integer" type validator', () => {
  it.each([
    ['{}'],
    ['{"min": 1}'],
    ['{"min": "1"}'],
    ['{"max": 100}'],
    ['{"max": "100"}'],
    ['{"less": 10}'],
    ['{"less": "10"}'],
    ['{"greater": 50}'],
    ['{"greater": "50"}'],
    ['{"min": 1, "max": 100}'],
    ['{"min": 1, "less": 10}'],
    ['{"min": 1, "greater": 50}'],
    ['{"less": 10, "max": 100}'],
    ['{"greater": 50, "max": 100}'],
    ['{"less": 10, "greater": 50, "max": 100}'],
    ['{"min": 10 ,"less": 10, "greater": 50}'],
    ['{"min": 10 ,"less": 10, "greater": 50, "max": 100}'],
    ['{"min": "10", "less": "10", "greater": "50", "max": "100"}'],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new IntegerTypeValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).not.toThrow();
    }
  );

  it.each([
    ['[]'],
    ['{"non-key": 1}'],
    ['{"key1": 1}'],
    ['{"key2": 2}'],
    ['{"key3": "value3"}'],
  ])(
    'Should be invalid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new IntegerTypeValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    ['1', '{"min": 1}'],
    [1, '{"min": 1}'],
    ['100', '{"max": 100}'],
    [100, '{"max": 100}'],
    ['3', '{"min": 1, "max":3}'],
    ['9', '{"less": 10}'],
    ['51', '{"greater": 50}'],
    ['2', '{"min": 1, "less":3}'],
    ['2', '{"greater": 1, "max":3}'],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: string | number, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new IntegerTypeValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );
  it.each([
    ['0', '{"min": 1}'],
    [0, '{"min": 1}'],
    ['101', '{"max": 100}'],
    [101, '{"max": 100}'],
    ['10', '{"less": 10}'],
    ['50', '{"greater": 50}'],
    ['3', '{"min": 1, "less":3}'],
    ['1', '{"greater": 1, "max":3}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: string | number, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new IntegerTypeValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );

  it('Should return TypeConstraint, MaxConstraint, and MinConstraint', async () => {
    // Arrange
    const validator = new IntegerTypeValidator({}, '');
    // Act
    const constraints = validator.getConstraints({
      min: 3,
      max: 5,
      greater: 10,
      less: 20,
    });
    // Assert
    expect(constraints.length).toBe(5);
    expect(constraints).toContainEqual(Constraint.Type('integer'));
    expect(constraints).toContainEqual(Constraint.MinValue(3, false));
    expect(constraints).toContainEqual(Constraint.MaxValue(5, false));
    expect(constraints).toContainEqual(Constraint.MinValue(10, true));
    expect(constraints).toContainEqual(Constraint.MaxValue(20, true));
  });
});
