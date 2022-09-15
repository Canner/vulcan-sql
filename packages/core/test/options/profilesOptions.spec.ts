import { ProfilesOptions, TYPES } from '@vulcan-sql/core';
import { Container } from 'inversify';
import * as os from 'os';
import * as path from 'path';

let container: Container;

beforeEach(() => {
  container = new Container();
  container.bind(TYPES.ProfilesOptions).to(ProfilesOptions).inSingletonScope();
});

it('Should append default paths when input option is empty', async () => {
  // Arrange
  const options = container.get<ProfilesOptions>(TYPES.ProfilesOptions);
  // Assert
  expect(options.length).toBe(2);
  expect(options).toContainEqual('profiles.yaml');
  expect(options).toContainEqual(
    path.resolve(os.homedir(), '.vulcan', 'profiles.yaml')
  );
});

it('Should append default paths when input option has values', async () => {
  // Arrange
  container
    .bind(TYPES.ProfilesInputOptions)
    .toConstantValue(['/foo/bar.yaml', '/foo/bar/profile.yaml']);
  const options = container.get<ProfilesOptions>(TYPES.ProfilesOptions);
  // Assert
  expect(options.length).toBe(4);
  // the order should be the same
  expect(options[0]).toEqual('/foo/bar.yaml');
  expect(options[1]).toEqual('/foo/bar/profile.yaml');
  expect(options).toContainEqual('profiles.yaml');
  expect(options).toContainEqual(
    path.resolve(os.homedir(), '.vulcan', 'profiles.yaml')
  );
});

it('Profiles should be unique', async () => {
  // Arrange
  container
    .bind(TYPES.ProfilesInputOptions)
    .toConstantValue([
      'profiles.yaml',
      '/foo/bar/profile.yaml',
      '/foo/bar/profile.yaml',
    ]);
  const options = container.get<ProfilesOptions>(TYPES.ProfilesOptions);
  // Assert
  expect(options.length).toBe(3);
  // the order should be the same
  expect(options[0]).toEqual('profiles.yaml');
  expect(options[1]).toEqual('/foo/bar/profile.yaml');
  expect(options[2]).toEqual(
    path.resolve(os.homedir(), '.vulcan', 'profiles.yaml')
  );
});
