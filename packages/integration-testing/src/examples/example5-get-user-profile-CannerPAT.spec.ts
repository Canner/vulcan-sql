import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import {
  ServeConfig,
  VulcanServer,
  CannerPATAuthenticator,
} from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import defaultConfig from './projectConfig';
import * as sinon from 'ts-sinon';

describe('Example3: get user profile by GET /auth/user-profile API with Authorization', () => {
  let server: VulcanServer;
  let projectConfig: ServeConfig & IBuildOptions;
  const mockUser = {
    username: 'apple Hey',
    firstName: 'Hey',
    lastName: 'apple',
    accountRole: 'admin',

    attributes: {
      attr1: 100 * 10000,
      attr2: 'Los Angeles',
    },
    createdAt: '2023-03-27T12:48:15.882Z',
    email: 'Alvina_Farrell82@yahoo.com',
    groups: [{ id: 1, name: 'group1' }],
  };
  const mockToken = `Canner-PAT myPATToken`;
  const mockCannerUserResponse = {
    status: 200,
    data: {
      data: {
        userMe: mockUser,
      },
    },
  };
  const expectedUserProfile = {
    name: mockUser.username,
    attr: {
      firstName: 'Hey',
      lastName: 'apple',
      accountRole: 'admin',

      attributes: {
        attr1: 100 * 10000,
        attr2: 'Los Angeles',
      },
      createdAt: '2023-03-27T12:48:15.882Z',
      email: 'Alvina_Farrell82@yahoo.com',
      groups: [{ id: 1, name: 'group1' }],
    },
  };
  // stub the private function to manipulate getting user info from remote server
  const stubFetchCannerUser = (user: any) => {
    const stub = sinon.default.stub(
      CannerPATAuthenticator.prototype,
      <any>'fetchCannerUser'
    );
    stub.resolves(user);
    return stub;
  };
  beforeEach(async () => {
    projectConfig = {
      ...defaultConfig,
      auth: {
        enabled: true,
        options: {
          'canner-pat': {
            host: 'mockhost',
            port: 3000,
            ssl: false,
          },
        },
      },
    };
  });

  afterEach(async () => {
    sinon.default.restore();
    await server?.close();
  });

  it('Example 3-1: set Authorization in header with default options', async () => {
    stubFetchCannerUser(mockCannerUserResponse);
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const agent = supertest(httpServer);
    const result = await agent
      .get('/auth/user-profile')
      .set('Authorization', mockToken);
    expect(result.body).toEqual(expectedUserProfile);
  }, 10000);

  it('Example 3-2: set Authorization in querying with default options', async () => {
    projectConfig['auth-source'] = {
      options: {
        key: 'x-auth',
      },
    };
    stubFetchCannerUser(mockCannerUserResponse);
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const agent = supertest(httpServer);
    const auth = Buffer.from(
      JSON.stringify({
        Authorization: `Canner-PAT ${Buffer.from(mockToken).toString(
          'base64'
        )}`,
      })
    ).toString('base64');
    const result = await agent.get(`/auth/user-profile?x-auth=${auth}`);

    expect(result.body).toEqual(expectedUserProfile);
  }, 10000);

  it('Example 3-3: set Authorization in querying with specific auth "key" options', async () => {
    projectConfig['auth-source'] = {
      options: {
        key: 'x-auth',
      },
    };
    stubFetchCannerUser(mockCannerUserResponse);
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const agent = supertest(httpServer);
    const auth = Buffer.from(
      JSON.stringify({
        Authorization: `Canner-PAT ${Buffer.from(mockToken).toString(
          'base64'
        )}`,
      })
    ).toString('base64');
    const result = await agent.get(`/auth/user-profile?x-auth=${auth}`);

    expect(result.body).toEqual(expectedUserProfile);
  }, 10000);

  it('Example 3-4: set Authorization in json payload specific auth "x-key" options', async () => {
    projectConfig['auth-source'] = {
      options: {
        key: 'x-auth',
        in: 'payload',
      },
    };
    stubFetchCannerUser(mockCannerUserResponse);
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const auth = Buffer.from(
      JSON.stringify({
        Authorization: `Canner-PAT ${Buffer.from(mockToken).toString(
          'base64'
        )}`,
      })
    ).toString('base64');

    const agent = supertest(httpServer);

    const result = await agent
      .get('/auth/user-profile')
      .send({
        ['x-auth']: auth,
      })
      .set('Accept', 'application/json');

    expect(result.body).toEqual(expectedUserProfile);
  }, 10000);
});
