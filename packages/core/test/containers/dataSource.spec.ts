import {
  DataResult,
  DataSource,
  dataSourceModule,
  Profile,
  TYPES,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Container, injectable, interfaces, multiInject } from 'inversify';

@VulcanExtensionId('ds1')
class DataSource1 extends DataSource {
  @multiInject(TYPES.Profile) public injectedProfiles!: Profile[];
  public execute(): Promise<DataResult> {
    throw new Error('Method not implemented.');
  }

  public prepare(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

@VulcanExtensionId('ds2')
class DataSource2 extends DataSource {
  @multiInject(TYPES.Profile) public injectedProfiles!: Profile[];
  public execute(): Promise<DataResult> {
    throw new Error('Method not implemented.');
  }

  public prepare(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

@VulcanExtensionId('ds3')
@injectable()
class DataSource3 {
  @multiInject(TYPES.Profile) public injectedProfiles!: Profile[];
}

it('Executor module should bind correct profiles to data sources and create a factory which return proper data sources', async () => {
  // Arrange
  const container = new Container();
  container
    .bind(TYPES.Extension_DataSource)
    .to(DataSource1)
    .whenTargetNamed('ds1');
  container
    .bind(TYPES.Extension_DataSource)
    .to(DataSource2)
    .whenTargetNamed('ds2');
  const profiles = new Map<string, Profile>();
  profiles.set('p1', { name: 'p1', type: 'ds1', allow: '*' });
  profiles.set('p2', { name: 'p2', type: 'ds1', allow: '*' });
  profiles.set('p3', { name: 'p3', type: 'ds2', allow: '*' });
  container.bind(TYPES.ExtensionConfig).toConstantValue({});
  container.bind(TYPES.ExtensionName).toConstantValue('');
  await container.loadAsync(dataSourceModule(profiles));
  const factory = container.get<interfaces.Factory<any>>(
    TYPES.Factory_DataSource
  );

  // Act
  const dsFromP1 = factory('p1') as DataSource1;
  const dsFromP2 = factory('p2') as DataSource1;
  const dsFromP3 = factory('p3') as DataSource2;

  // Assert
  expect(dsFromP1 instanceof DataSource1).toBeTruthy();
  expect(dsFromP2 instanceof DataSource1).toBeTruthy();
  expect(dsFromP3 instanceof DataSource2).toBeTruthy();
  expect(dsFromP1.injectedProfiles).toEqual([
    { name: 'p1', type: 'ds1', allow: '*' },
    { name: 'p2', type: 'ds1', allow: '*' },
  ]);
  expect(dsFromP3.injectedProfiles).toEqual([
    { name: 'p3', type: 'ds2', allow: '*' },
  ]);
});

it('Data source factory should throw error with invalid profile name', async () => {
  // Arrange
  const container = new Container();
  const profiles = new Map<string, Profile>();
  await container.loadAsync(dataSourceModule(profiles));
  container.bind(TYPES.ExtensionConfig).toConstantValue({});
  container.bind(TYPES.ExtensionName).toConstantValue('');
  const factory = container.get<interfaces.Factory<any>>(
    TYPES.Factory_DataSource
  );
  // Act, Assert
  expect(() => factory('some-invalid-profile')).toThrow(
    `Profile some-invalid-profile not found`
  );
});

it('When the requestor is not a data source, container should return all profiles', async () => {
  // Arrange
  const container = new Container();
  const profiles = new Map<string, Profile>();
  profiles.set('p1', { name: 'p1', type: 'ds1', allow: '*' });
  profiles.set('p2', { name: 'p2', type: 'ds1', allow: '*' });
  profiles.set('p3', { name: 'p3', type: 'ds2', allow: '*' });
  container.bind(TYPES.Extension_DataSource).to(DataSource3);
  await container.loadAsync(dataSourceModule(profiles));

  // Act
  const ds3 = container.get<DataSource3>(TYPES.Extension_DataSource);
  const profilesInjected = ds3.injectedProfiles;

  // Assert
  expect(profilesInjected.length).toEqual(3);
});
