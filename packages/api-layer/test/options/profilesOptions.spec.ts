import {
  ProfilesLookupOptions,
  ProfilesLookupType,
  TYPES,
} from '@vulcan-sql/api-layer';
import { Container } from 'inversify';
import * as os from 'os';
import * as path from 'path';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.ProfilesLookupOptions)
    .to(ProfilesLookupOptions)
    .inSingletonScope();
});

it('Should append default paths when input option is empty', async () => {
  // Arrange
  const options = container.get<ProfilesLookupOptions>(
    TYPES.ProfilesLookupOptions
  );
  // Act
  const lookups = options.getLookups();
  // Assert
  expect(lookups.length).toBe(2);
  expect(lookups).toContainEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: 'profiles.yaml' },
  });
  expect(lookups).toContainEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: path.resolve(os.homedir(), '.vulcan', 'profiles.yaml') },
  });
});

it('Should append default paths when input option has values', async () => {
  // Arrange
  container
    .bind(TYPES.ProfilesLookupInputOptions)
    .toConstantValue(['/foo/bar.yaml', '/foo/bar/profile.yaml']);
  const options = container.get<ProfilesLookupOptions>(
    TYPES.ProfilesLookupOptions
  );
  // Act
  const lookups = options.getLookups();
  // Assert
  expect(lookups.length).toBe(4);
  // the order should be the same
  expect(lookups[0]).toEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: '/foo/bar.yaml' },
  });
  expect(lookups[1]).toEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: '/foo/bar/profile.yaml' },
  });
  expect(lookups).toContainEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: 'profiles.yaml' },
  });
  expect(lookups).toContainEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: path.resolve(os.homedir(), '.vulcan', 'profiles.yaml') },
  });
});

it('Profiles should be unique', async () => {
  // Arrange
  container.bind(TYPES.ProfilesLookupInputOptions).toConstantValue([
    'profiles.yaml',
    '/foo/bar/profile.yaml',
    {
      type: ProfilesLookupType.LocalFile,
      options: { path: '/foo/bar/profile.yaml' },
    },
  ]);
  const options = container.get<ProfilesLookupOptions>(
    TYPES.ProfilesLookupOptions
  );
  // Act
  const lookups = options.getLookups();
  // Assert
  expect(lookups.length).toBe(3);
  // the order should be the same
  expect(lookups[0]).toEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: 'profiles.yaml' },
  });
  expect(lookups[1]).toEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: '/foo/bar/profile.yaml' },
  });
  expect(lookups[2]).toEqual({
    type: ProfilesLookupType.LocalFile,
    options: { path: path.resolve(os.homedir(), '.vulcan', 'profiles.yaml') },
  });
});
