import { LocalFileProfileReader } from '@vulcan-sql/api-layer';
import * as path from 'path';

const profile1Path = path.resolve(__dirname, 'profile1.yaml');
const profile2Path = path.resolve(__dirname, 'profile2.yaml');

it('Should throw error when lookup options do not have path config', async () => {
  // Arrange
  const localFile = new LocalFileProfileReader({}, '');
  // Act, Assert
  await expect(localFile.read({} as any)).rejects.toThrow(
    `LocalFile profile reader needs options.path property`
  );
});

it('Should load the correct profiles when there is no issue', async () => {
  // Arrange
  const localFile = new LocalFileProfileReader({}, '');
  // Act
  const profiles = await localFile.read({ path: profile1Path });
  // Assert
  expect(profiles).toContainEqual({
    name: 'db1',
    type: 'db1-type',
    connection: {
      foo: 'bar',
    },
    cache: {
      foo: 'bar',
    },
  });
});

it('Should deny the invalid profile', async () => {
  // Arrange
  const localFile = new LocalFileProfileReader({}, '');
  // Act, Assert
  await expect(localFile.read({ path: profile2Path })).rejects.toThrow(
    `Invalid profile in ${profile2Path}. Profile name and type are required.`
  );
});
