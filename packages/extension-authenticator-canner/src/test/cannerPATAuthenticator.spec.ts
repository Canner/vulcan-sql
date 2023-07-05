import * as sinon from 'ts-sinon';
import axios from 'axios';
import { IncomingHttpHeaders } from 'http';
import { Request } from 'koa';
import { CannerPATAuthenticator } from '../lib/authenticator';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const getStubAuthenticator = async (
  options: any,
  stubValue: any = null
): Promise<CannerPATAuthenticator> => {
  const authenticator = new CannerPATAuthenticator({ options }, '');
  if (stubValue) {
    // TODO: refactor to avoid stubbing private method
    // stub the private method fetchCannerUser to simulate the response from remote server
    sinon.default
      .stub(authenticator, <any>'fetchCannerUser')
      .resolves(stubValue);
  }
  await authenticator.activate();
  return authenticator;
};

const expectFailed = (
  message = 'authenticate user by "canner-pat" type failed.'
) => ({
  status: AuthStatus.FAIL,
  type: 'canner-pat',
  message,
});
const mockOptions = {
  'canner-pat': {
    host: 'mockHost',
    port: 3000,
    ssl: false,
  },
};

it.each([
  { 'canner-pat': { port: 3000, ssl: true } },
  { 'canner-pat': { port: 3000 } },
  { 'canner-pat': { ssl: false } },
  { 'canner-pat': {} },
])('Should throw configuration error when options = %p', async (options) => {
  // Arrange
  const ctx = {
    ...sinon.stubInterface<KoaContext>(),
    request: {
      ...sinon.stubInterface<Request>(),
      headers: {
        authorization: 'Canner-PAT 1234567890',
      },
    },
  } as KoaContext;
  const authenticator = await getStubAuthenticator(options);

  // Act, Assert
  await expect(authenticator.authCredential(ctx)).rejects.toThrow(
    'please provide correct connection information to Canner Enterprise, including "host".'
  );
});

// the situation of status code 4xx, 5xx(including 401, 403) is handled by axios
it('Should auth credential failed when getting status code that is not 2xx from the remote server', async () => {
  // Arrange
  const ctx = {
    ...sinon.stubInterface<KoaContext>(),
    request: {
      ...sinon.stubInterface<Request>(),
      headers: {
        ...sinon.stubInterface<IncomingHttpHeaders>(),
        authorization: `Canner-PAT eyValidToken`,
      },
    },
  } as KoaContext;
  // mock axios.post method get non 200 response from remote server then axios throw error
  mockedAxios.post.mockRejectedValue({
    request: 'mock request',
    response: {
      data: { error: 'mock response error' },
      status: 500,
      statusText: 'string',
      headers: {},
      config: {},
    } as any,
    isAxiosError: true,
    toJSON: () => ({}),
    message: 'An error occurred!',
    name: 'Error',
  });
  const authenticator = await getStubAuthenticator(mockOptions);

  // Act
  const res = await authenticator.authCredential(ctx);

  // Assert
  await expect(res).toEqual(
    expectFailed(
      'Failed to fetch user info from canner server: response status: 500, response data: {"error":"mock response error"}'
    )
  );
}, 10000);

it('Should auth credential successful when request header "authorization" pass the canner host', async () => {
  // Arrange
  const ctx = {
    ...sinon.stubInterface<KoaContext>(),
    request: {
      ...sinon.stubInterface<Request>(),
      headers: {
        ...sinon.stubInterface<IncomingHttpHeaders>(),
        authorization: `Canner-PAT eyValidToken`,
      },
    },
  } as KoaContext;
  const mockResolveValue = {
    status: 200,
    data: {
      data: {
        userMe: {
          email: 'myEmail@google.com',
          enabled: true,
          username: 'mockUser',
          attr1: 'value1',
        },
      },
    },
  };
  const expected = {
    status: AuthStatus.SUCCESS,
    type: 'canner-pat',
    user: {
      name: 'mockUser',
      attr: {
        email: 'myEmail@google.com',
        enabled: true,
        attr1: 'value1',
      },
    },
  } as AuthResult;
  const authenticator = await getStubAuthenticator(
    mockOptions,
    mockResolveValue
  );

  // Act
  const result = await authenticator.authCredential(ctx);

  // Assert
  expect(result).toEqual(expected);
});

// Token info
it('Should throw error when use getTokenInfo with cannerPATAuthenticator', async () => {
  // Arrange
  const ctx = {
    ...sinon.stubInterface<KoaContext>(),
    request: {
      ...sinon.stubInterface<Request>(),
      body: {},
    },
  };
  const authenticator = await getStubAuthenticator(mockOptions);
  // Act Assert
  await expect(authenticator.getTokenInfo(ctx)).rejects.toThrow(
    'canner-pat does not support token generate.'
  );
});
