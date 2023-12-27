import { plainToInstance, instanceToPlain } from 'class-transformer';
import { RequestSchema } from '@vulcan-sql/api-layer/models';
import { Constraint, FieldDataType, FieldInType } from '@vulcan-sql/api-layer';

it('Every constraint can be serialize and deserialize', async () => {
  // Arrange
  const constraints = [
    Constraint.Required(),
    Constraint.MinValue(10),
    Constraint.MaxValue(100, true),
    Constraint.MinLength(10),
    Constraint.MaxLength(100),
    Constraint.Enum([1, 2, 3, 4]),
    Constraint.Regex('.+'),
    Constraint.Type('array'),
  ];
  const request: RequestSchema = {
    fieldName: 'test',
    fieldIn: FieldInType.QUERY,
    description: '',
    type: FieldDataType.BOOLEAN,
    validators: [],
    constraints,
  };
  // Act
  const plainObject = instanceToPlain(request);
  const instance = plainToInstance(RequestSchema, plainObject);
  // Assert
  expect(instance).toEqual(request);
});
