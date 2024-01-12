import { getUrl, ConnectionConfig } from '../../src/lib/api-layer/utils/url';

describe('url util functions', () => {
  it('should return url if all connection properties were set', () => {
    const connection = {
      ssl: true,
      host: 'localhost',
      port: 8080,
      path: '/test',
    } as ConnectionConfig;

    const url = getUrl(connection);
    expect(url).toBe('https://localhost:8080/test');
  });

  it('should return url if ssl or path is not set', () => {
    const connection = {
      host: 'localhost',
    } as ConnectionConfig;

    const url = getUrl(connection);
    expect(url).toBe('http://localhost/');
  });

  it('should return url if host was an IP address', () => {
    const connection = {
      ssl: false,
      host: '127.0.0.1',
      port: 8080,
      path: '/test',
    } as ConnectionConfig;
    const url = getUrl(connection);
    expect(url).toBe('http://127.0.0.1:8080/test');
  });

  it.each([
    {
      ssl: false,
      host: 'localhost',
      port: 8080,
      path: '/test',
    },
    {
      host: 'localhost',
      port: 8080,
      path: '/test',
    },
  ])(
    'should use protocal http if ssl was not set or set to false',
    (connection) => {
      const url = getUrl(connection);
      expect(url).toBe('http://localhost:8080/test');
    }
  );

  it('should return url if host was a DNS name and port was not set', () => {
    const connection = {
      ssl: true,
      host: 'DNSName',
      path: '/test',
    } as ConnectionConfig;

    const url = getUrl(connection);
    expect(url).toBe('https://dnsname/test');
  });
});
