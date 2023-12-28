export interface ConnectionConfig {
  ssl?: boolean;
  host?: string;
  port?: number | string;
  path?: string;
}

export const getUrl = (connection: ConnectionConfig): string => {
  const { ssl, host, port, path = '' } = connection;
  const protocol = ssl ? 'https' : 'http';
  let urlbase = `${protocol}://${host}`;
  urlbase = port ? `${urlbase}:${port}` : urlbase;
  return new URL(path, urlbase).href;
};
