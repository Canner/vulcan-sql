import { RawAPISchema } from '@vulcan/build/schema-parser';
import { setConstraints } from '@vulcan/build/schema-parser/middleware';
import {
  Constraint,
  MinValueConstraint,
  RequiredConstraint,
  ValidatorLoader,
} from '@vulcan/core';
import * as sinon from 'ts-sinon';

it('Should set and compose constraints', async () => {
  // Arrange
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  stubValidatorLoader.getLoader.callsFake((name) => ({
    name,
    validateData: () => true,
    validateSchema: () => true,
    getConstraints: (args) => {
      if (name === 'required') return [Constraint.Required()];
      return [Constraint.MinValue(args.value)];
    },
  }));

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
  // Act
  await setConstraints(stubValidatorLoader)(schema, async () =>
    Promise.resolve()
  );
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
