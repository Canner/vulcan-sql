import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import * as oas3 from 'openapi3-ts';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { BaseStorageService } from '@canner/canner-storage';
import { APISchema, ArtifactBuilderOptions } from '@vulcan-sql/core';
import * as storageServiceModule from '../lib/storageService';
import {
  BuiltInArtifact,
  CannerPersistenceStore,
  RawBuiltInArtifact,
} from '../lib/cannerPersistenceStore';
import { getEnvConfig } from '../lib/config';

describe('Test CannerPersistenceStore', () => {
  // support reading the env from .env file if exited when running test case
  dotenv.config({ path: path.resolve(__dirname, '.env') });
  const config = getEnvConfig();

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
      artifact: {
        name: `${fakeWorkspaces.ws1.id}/vulcansql/${fakeWorkspaces.ws1.folders[1]}/result.json`,
      },
      others: [
        { name: `${fakeWorkspaces.ws1.id}/notebook` },
        { name: `${fakeWorkspaces.ws1.id}/notebook_output` },
      ],
    },
    ws2: {
      indicator: { name: `${fakeWorkspaces.ws2.id}/vulcansql/indicator.json` },
      artifact: {
        name: `${fakeWorkspaces.ws2.id}/vulcansql/${fakeWorkspaces.ws2.folders[1]}/result.json`,
      },
      others: [{ name: `${fakeWorkspaces.ws2.id}/data` }],
    },
  };

  afterEach(() => {
    // restore all the stubs and spies
    sinon.default.restore();
  });

  it('Should throw error when calling the save method', async () => {
    // Arrange
    const stubOption = sinon.stubInterface<ArtifactBuilderOptions>();
    const store = new CannerPersistenceStore(stubOption, {}, 'Canner');

    // Act, Assert
    await expect(
      store.save(Buffer.from(faker.lorem.word()))
    ).rejects.toThrowError(
      'The extension not provide the save method, it only use to load the data from the storage'
    );
  });

  it('Should load failed when "specs" field is not "oas3" format for some artifacts ', async () => {
    // Arrange
    // Stub the storage service
    const stubStorageService = sinon.stubInterface<BaseStorageService>();
    stubStorageService.listObjects.resolves([
      fakeStorageListedObjectsInfo.ws1.indicator,
      fakeStorageListedObjectsInfo.ws1.artifact,
      ...fakeStorageListedObjectsInfo.ws1.others,
      fakeStorageListedObjectsInfo.ws2.indicator,
      fakeStorageListedObjectsInfo.ws2.artifact,
      ...fakeStorageListedObjectsInfo.ws2.others,
    ]);

    // Stub the "downObjectAsBuffer" method to return the indicator content when the file name match "indicator.json" path
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws1.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws1)));
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws2.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws2)));

    // Stub the "downObjectAsBuffer" method to return the artifact content when the file name match "result.json" path
    stubStorageService.downObjectAsBuffer
      // make the ws1 artifact not use "oas3" format, so it will throw error
      .withArgs(fakeStorageListedObjectsInfo.ws1.artifact)
      .resolves(
        Buffer.from(
          JSON.stringify({
            templates: {},
            schemas: [],
            specs: {},
          } as RawBuiltInArtifact)
        )
      );
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws2.artifact)
      .resolves(
        Buffer.from(
          JSON.stringify({
            templates: {},
            schemas: [],
            specs: { oas3: {} },
          } as RawBuiltInArtifact)
        )
      );

    // stub the create storage service factory to replace the stub storage service
    sinon.default
      .stub(storageServiceModule, 'createStorageService')
      .resolves(stubStorageService);

    const stubOption = sinon.stubInterface<ArtifactBuilderOptions>();
    const store = new CannerPersistenceStore(stubOption, {}, 'Canner');

    // Act, Assert
    await expect(store.load()).rejects.toThrowError(
      `The workspace sql name "${fakeWorkspaces.ws1.sqlName}" artifact not use "oas3" specification, canner persistence store only support the "oas3" specification`
    );
  });

  it('Should load successfully when "specs" field is "oas3" format ', async () => {
    // Arrange

    // test artifacts from each workspaces downloaded from storage
    const artifacts = {
      ws1: {
        templates: { 'sales/orders': 'select 1' },
        schemas: [
          {
            ...sinon.stubInterface<APISchema>(),
            urlPath: '/orders',
            templateSource: 'sales/orders',
            profiles: [faker.word.noun()],
          },
        ],
        specs: {
          oas3: {
            ...sinon.stubInterface<oas3.OpenAPIObject>(),
            paths: {
              '/orders': {},
            },
          },
        },
      } as BuiltInArtifact,
      ws2: {
        templates: { 'marketing/products': 'select 2' },
        schemas: [
          {
            ...sinon.stubInterface<APISchema>(),
            urlPath: '/products/:id',
            templateSource: 'marketing/products',
            profiles: [faker.word.noun()],
          },
        ],
        specs: {
          oas3: {
            ...sinon.stubInterface<oas3.OpenAPIObject>(),
            paths: {
              '/products/:id': {},
            },
          },
        },
      } as BuiltInArtifact,
    } as Record<string, BuiltInArtifact>;

    // expected merged result
    const expected = {
      templates: {
        [`${fakeWorkspaces.ws1.sqlName}/sales/orders`]: 'select 1',
        [`${fakeWorkspaces.ws2.sqlName}/marketing/products`]: 'select 2',
      },
      schemas: [
        {
          urlPath: `${fakeWorkspaces.ws1.sqlName}/orders`,
          templateSource: `${fakeWorkspaces.ws1.sqlName}/sales/orders`,
          profiles: config.profiles,
        },
        {
          urlPath: `${fakeWorkspaces.ws2.sqlName}/products/:id`,
          templateSource: `${fakeWorkspaces.ws2.sqlName}/marketing/products`,
          profiles: config.profiles,
        },
      ],
      specs: {
        oas3: {
          openapi: '3.0.3',
          info: {
            title: 'Data API',
            version: 'latest',
            description: 'Data API for Canner Enterprise',
          },
          paths: {
            [`${fakeWorkspaces.ws1.sqlName}/orders`]:
              artifacts['ws1'].specs['oas3'].paths['/orders'],
            [`${fakeWorkspaces.ws2.sqlName}/products/:id`]:
              artifacts['ws2'].specs['oas3'].paths['/products/:id'],
          },
        },
      },
    } as BuiltInArtifact;

    // Stub the storage service
    const stubStorageService = sinon.stubInterface<BaseStorageService>();
    stubStorageService.listObjects.resolves([
      fakeStorageListedObjectsInfo.ws1.indicator,
      fakeStorageListedObjectsInfo.ws1.artifact,
      ...fakeStorageListedObjectsInfo.ws1.others,
      fakeStorageListedObjectsInfo.ws2.indicator,
      fakeStorageListedObjectsInfo.ws2.artifact,
      ...fakeStorageListedObjectsInfo.ws2.others,
    ]);

    // Stub the "downObjectAsBuffer" method to return the indicator content when the file name match "indicator.json" path
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws1.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws1)));
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws2.indicator)
      .resolves(Buffer.from(JSON.stringify(fakeIndicators.ws2)));

    // Stub the "downObjectAsBuffer" method to return the artifact content when the file name match "result.json" path
    stubStorageService.downObjectAsBuffer
      // make the ws1 artifact not use "oas3" format, so it will throw error
      .withArgs(fakeStorageListedObjectsInfo.ws1.artifact)
      .resolves(Buffer.from(JSON.stringify(artifacts['ws1']), 'utf-8'));
    stubStorageService.downObjectAsBuffer
      .withArgs(fakeStorageListedObjectsInfo.ws2.artifact)
      .resolves(Buffer.from(JSON.stringify(artifacts['ws2']), 'utf-8'));

    // stub the create storage service factory to replace the stub storage service
    sinon.default
      .stub(storageServiceModule, 'createStorageService')
      .resolves(stubStorageService);

    const stubOption = sinon.stubInterface<ArtifactBuilderOptions>();
    const store = new CannerPersistenceStore(stubOption, {}, 'Canner');

    const mergedArtifact = JSON.parse((await store.load()).toString('utf-8'));
    // Act, Assert
    expect(mergedArtifact).toEqual(expected);
  });
});
