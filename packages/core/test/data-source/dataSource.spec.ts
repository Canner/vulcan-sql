import {
  DataResult,
  DataSource,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';

@VulcanExtensionId('mock')
export class MockDataSource extends DataSource {
  public async execute(): Promise<DataResult> {
    return {} as any;
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  public override getProfiles() {
    return super.getProfiles();
  }

  public override getProfile(name: string) {
    return super.getProfile(name);
  }
}

it(`GetProfiles function should return all profiles which belong to us`, async () => {
  // Arrange
  const mockDataSource = new MockDataSource({}, '', [
    {
      name: 'profile1',
      type: 'mock',
    },
    {
      name: 'profile2',
      type: 'mock',
    },
  ]);
  // Act
  const profiles = mockDataSource.getProfiles();
  // Assert
  expect(profiles.size).toBe(2);
});

it(`GetProfile function should correct profile`, async () => {
  // Arrange
  const mockDataSource = new MockDataSource({}, '', [
    {
      name: 'profile1',
      type: 'mock',
    },
    {
      name: 'profile2',
      type: 'mock',
    },
  ]);
  // Act
  const profile = mockDataSource.getProfile('profile1');
  // Assert
  expect(profile.name).toBe('profile1');
});

it(`GetProfile function should throw error with invalid profile name`, async () => {
  // Arrange
  const mockDataSource = new MockDataSource({}, '', []);
  // Act, Assert
  expect(() => mockDataSource.getProfile('profile1')).toThrow(
    `Profile name profile1 not found in data source mock`
  );
});
