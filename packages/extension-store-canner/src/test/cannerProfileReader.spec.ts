import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  CannerProfileReader,
  CannerProfileReaderOptions,
} from '../lib/canner/profileReader';
import { BaseStorageService } from '@canner/canner-storage';
import * as storageServiceModule from '../lib/storageService';
import * as configModule from '../lib/config';
import { Profile } from '@vulcan-sql/core';

describe('Test CannerProfileReader', () => {
  // fake workspaceId
  const fakeWorkspaces = {
    // fake workspace id and sql name
    ws1: {
      id: faker.datatype.uuid(),
      sqlName: 'wsId1',
      folders: ['first-folder', 'latest-folder'],
    },
    ws2: {
      id: faker.datatype.uuid(),
      sqlName: 'wsId2',
      folders: ['first-folder', 'latest-folder'],
    },
  };
  const fakeIndicators = {
    ws1: {
      master: '75f151da',
      '8bae2f87': fakeWorkspaces.ws1.folders[0],
      '75f151da': fakeWorkspaces.ws1.folders[1],
      [fakeWorkspaces.ws1.id]: fakeWorkspaces.ws1.sqlName,
    },
    ws2: {
      master: '711c034c',
      '3f051d57': fakeWorkspaces.ws2.folders[0],
      '711c034c': fakeWorkspaces.ws2.folders[1],
      [fakeWorkspaces.ws2.id]: fakeWorkspaces.ws2.sqlName,
    },
  };
  const fakeStorageListedObjectsInfo = {
    ws1: {
      indicator: { name: `${fakeWorkspaces.ws1.id}/vulcansql/indicator.json` },
      others: [
        { name: `${fakeWorkspaces.ws1.id}/notebook` },
        { name: `${fakeWorkspaces.ws1.id}/notebook_output` },
      ],
    },
    ws2: {
      indicator: { name: `${fakeWorkspaces.ws2.id}/vulcansql/indicator.json` },
      others: [{ name: `${fakeWorkspaces.ws2.id}/data` }],
    },
  };

  afterEach(() => {
    // restore all the stubs and spies
    sinon.default.restore();
  });

  it('Should read failed when "path" is not provided', async () => {
    // Arrange
    const reader = new CannerProfileReader({}, 'Canner');
    // Act, Assert
    await expect(reader.read({})).rejects.toThrowError(
      'Canner profile reader needs options.path property'
    );
  });

  it.each([
    ['localhost', undefined],
    [undefined, faker.internet.password()],
  ])(
    'Should read failed when host = "%s", password = "%s"',
    async (host, password) => {
      // Arrange

      // Stub the storage service
      const stubStorageService = sinon.stubInterface<BaseStorageService>();
      stubStorageService.listObjects.resolves([
        fakeStorageListedObjectsInfo.ws1.indicator,
        ...fakeStorageListedObjectsInfo.ws1.others,
        fakeStorageListedObjectsInfo.ws2.indicator,
        ...fakeStorageListedObjectsInfo.ws2.others,
      ]);

      // Stub the "downObjectAsBuffer" method to return the indicator content when the file name match "indicator.json" path
      stubStorageService.downObjectAsBuffer
        .withArgs(fakeStorageListedObjectsInfo.ws1.indicator)
        .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws1)));
      stubStorageService.downObjectAsBuffer
        .withArgs(fakeStorageListedObjectsInfo.ws2.indicator)
        .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws2)));

      // stub the create storage service factory to replace the stub storage service
      sinon.default
        .stub(storageServiceModule, 'createStorageService')
        .resolves(stubStorageService);

      sinon.default.stub(configModule, 'getEnvConfig').returns({
        storage: sinon.stubInterface<configModule.StorageServiceOptions>(),
        properties: {},
        profile: {
          host,
          password,
        },
      });
      const reader = new CannerProfileReader({}, 'Canner');
      await expect(
        reader.read(sinon.stubInterface<CannerProfileReaderOptions>())
      ).rejects.toThrowError(
        'Canner profile reader needs username, password, host properties.'
      );
    }
  );

  it('Should read successfully when options and env config both provided', async () => {
    // Arrange
    const connectionInfo = {
      host: 'localhost',
      user: 'canner',
      password: 'secret-password',
      port: 7432,
    };
    const expected = [
      {
        name: `canner-${fakeWorkspaces.ws1.sqlName}`,
        type: 'canner',
        connection: {
          ...connectionInfo,
          database: fakeWorkspaces.ws1.sqlName,
        },
        allow: '*',
      },
      {
        name: `canner-${fakeWorkspaces.ws2.sqlName}`,
        type: 'canner',
        connection: {
          ...connectionInfo,
          database: fakeWorkspaces.ws2.sqlName,
        },
        allow: '*',
      },
    ] as Profile<Record<string, any>>[];
    // Stub the storage service
    const stubStorageService = sinon.stubInterface<BaseStorageService>();
    stubStorageService.listObjects.resolves([
      fakeStorageListedObjectsInfo.ws1.indicator,
      ...fakeStorageListedObjectsInfo.ws1.others,
      fakeStorageListedObjectsInfo.ws2.indicator,
      ...fakeStorageListedObjectsInfo.ws2.others,
    ]);

    // Stub the "downObjectAsBuffer" method to return the indicator content when the file name match "indicator.json" path
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws1.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws1)));
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws2.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws2)));

    // stub the create storage service factory to replace the stub storage service
    sinon.default
      .stub(storageServiceModule, 'createStorageService')
      .resolves(stubStorageService);

    sinon.default.stub(configModule, 'getEnvConfig').returns({
      storage: sinon.stubInterface<configModule.StorageServiceOptions>(),
      properties: {},
      profile: {
        ...connectionInfo,
      },
    });
    const reader = new CannerProfileReader({}, 'Canner');
    // Act
    const profiles = await reader.read(
      sinon.stubInterface<CannerProfileReaderOptions>()
    );
    // Assert
    await expect(profiles).toEqual(expected);
  });
});
