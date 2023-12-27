import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { SetConstraints } from '@vulcan-sql/build/schema-parser/middleware/setConstraints';
import {
  Constraint,
  MinValueConstraint,
  RequiredConstraint,
  IValidatorLoader,
} from '@vulcan-sql/api-layer';
import * as sinon from 'ts-sinon';

it('Should set and compose constraints', async () => {
  // Arrange
  const stubValidatorLoader = sinon.stubInterface<IValidatorLoader>();
  stubValidatorLoader.getValidator.callsFake(
    (name) =>
      ({
        name,
        validateData: () => null,
        validateSchema: () => null,
        getConstraints: (args: any) => {
          if (name === 'required') return [Constraint.Required()];
          return [Constraint.MinValue(args.value)];
        },
      } as any)
  );

  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    request: [
      {
        validators: [
          { name: 'required', args: {} },
          { name: 'minValue', args: { value: 3 } },
          { name: 'minValue', args: { value: 1000 } },
        ],
      },
    ],
  };
  const setConstraints = new SetConstraints(stubValidatorLoader);
  // Act
  await setConstraints.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].constraints?.length).toEqual(2);
  expect(
    schema.request?.[0].constraints?.[0] instanceof RequiredConstraint
  ).toBeTruthy();
  expect(
    schema.request?.[0].constraints?.[1] instanceof MinValueConstraint
  ).toBeTruthy();
  expect(
    (schema.request?.[0].constraints?.[1] as MinValueConstraint).getMinValue()
  ).toBe(1000);
});
