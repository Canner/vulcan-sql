import { CheckProfile } from '@vulcan-sql/build/schema-parser/middleware/checkProfile';
import { RawAPISchema } from '../../../src';

it('Should throw error when there is no profile', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/user',
  } as any;
  const checkProfile = new CheckProfile(() => ({} as any));
  // Act, Assert
  await expect(
    checkProfile.handle(schema, async () => Promise.resolve())
  ).rejects.toThrow(`The profile of schema /user is not defined`);
});

it('Should throw error when the profile is invalid', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/user',
    profile: 'profile1',
  } as any;
  const checkProfile = new CheckProfile(() => {
    throw new Error(`profile not found`);
  });
  // Act, Assert
  await expect(
    checkProfile.handle(schema, async () => Promise.resolve())
  ).rejects.toThrow(
    `The profile profile1 of schema /user is invalid: profile not found`
  );
});

it('Should pass when the profile is valid', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/user',
    profile: 'profile1',
  } as any;
  const checkProfile = new CheckProfile(() => ({} as any));
  // Act, Assert
  await expect(
    checkProfile.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});
