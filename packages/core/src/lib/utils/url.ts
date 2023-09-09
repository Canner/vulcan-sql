export interface ConnectionConfig {
  ssl?: boolean | undefined;
  host?: string | undefined;
  port?: number | string;
  path?: string | undefined;
}

export const getUrl = (connection: ConnectionConfig): string => {
  const { ssl, host, port, path = '' } = connection;
  const protocol = ssl ? 'https' : 'http';
  let urlbase = `${protocol}://${host}`;
  urlbase = port ? `${urlbase}:${port}` : urlbase;
  return new URL(path, urlbase).href;
};
