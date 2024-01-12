import sinon from 'ts-sinon';
import { HttpLogger } from '../src/lib/api-layer/loggers/httpLogger';
class MockHttpLogger extends HttpLogger {
  public override sendActivityLog = jest.fn();
}
const createMockHttpLogger = (config: any) => {
  return new MockHttpLogger(config, 'httpLogger');
};
describe('Activity logs', () => {
  it('should throw error when logger is enabled but connection is not provided', async () => {
    const config = {
      enabled: true,
      options: {
        'http-logger': {
          connection: undefined,
        },
      },
    };

    const httpLogger = createMockHttpLogger(config);

    await expect(httpLogger.log({})).rejects.toThrow(
      'Http logger connection should be provided'
    );
  });

  it('should not throw error when logger is disabled', async () => {
    const config = {
      enabled: false,
    };

    const httpLogger = createMockHttpLogger(config);

    await expect(httpLogger.log({})).resolves.not.toThrow();
  });

  // should not throw error when logger is enabled and connection is provided
  it('should not throw error when logger is enabled and connection is provided', async () => {
    const config = {
      enabled: true,
      options: {
        'http-logger': {
          connection: {
            ssl: true,
            host: 'localhost',
            port: 8080,
            path: '/test',
          },
        },
      },
    };
    const httpLogger = createMockHttpLogger(config);
    sinon.stub(httpLogger, 'sendActivityLog').resolves();
    await expect(httpLogger.log({})).resolves.not.toThrow();
  });

  // should throw error when logger is enabled and connection is provided but request fails
  it('should throw error when logger is enabled and connection is provided but request fails', async () => {
    const config = {
      enabled: true,
      options: {
        'http-logger': {
          connection: {
            ssl: true,
            host: 'localhost',
            port: 8080,
            path: '/test',
          },
        },
      },
    };
    // stub sendActivityLog to throw error
    const httpLogger = createMockHttpLogger(config);
    sinon.stub(httpLogger, 'sendActivityLog').throws();
    await expect(httpLogger.log({})).rejects.toThrow();
  });

  // isEnabled should return false when logger is disabled
  it.each([
    {}, // empty config
    {
      enabled: false, // not enabled
    },
    {
      enabled: false, // not enabled but has logger
      options: {
        'http-logger': { connection: { host: 'localhost', port: 80 } },
      },
    },
    {
      enabled: true, // enabled but do not have http-logger config
      options: {
        'non-http-logger': {},
      },
    },
  ])(
    'isEnabled should return false when logger is disabled',
    async (config) => {
      const httpLogger = createMockHttpLogger(config);
      expect(httpLogger.isEnabled()).toBe(false);
    }
  );
});
