import {
  executorModule,
  Profile,
  TYPES,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import { Container, injectable, interfaces, multiInject } from 'inversify';

@injectable()
@VulcanExtensionId('ds1')
class DataSource1 {
  constructor(@multiInject(TYPES.Profile) public profiles: Profile[]) {}
}

@injectable()
@VulcanExtensionId('ds2')
class DataSource2 {
  constructor(@multiInject(TYPES.Profile) public profiles: Profile[]) {}
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
  profiles.set('p1', { name: 'p1', type: 'ds1' });
  profiles.set('p2', { name: 'p2', type: 'ds1' });
  profiles.set('p3', { name: 'p3', type: 'ds2' });
  await container.loadAsync(executorModule(profiles));
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
  expect(dsFromP1.profiles).toEqual([
    { name: 'p1', type: 'ds1' },
    { name: 'p2', type: 'ds1' },
  ]);
  expect(dsFromP3.profiles).toEqual([{ name: 'p3', type: 'ds2' }]);
});

it('Data source factory should throw error with invalid profile name', async () => {
  // Arrange
  const container = new Container();
  const profiles = new Map<string, Profile>();
  await container.loadAsync(executorModule(profiles));
  const factory = container.get<interfaces.Factory<any>>(
    TYPES.Factory_DataSource
  );
  // Act, Arrange
  expect(() => factory('some-invalid-profile')).toThrow(
    `Profile some-invalid-profile not found`
  );
});
