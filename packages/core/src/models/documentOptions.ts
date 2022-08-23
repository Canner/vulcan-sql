export enum DocumentSpec {
  oas3 = 'oas3',
}

export enum DocumentServerType {
  redoc = 'redoc',
}

export interface IDocumentOptions {
  /** Target specification of our APIs, e.g. OpenAPI, Tinyspec ...etc. */
  specs?: (string | DocumentSpec)[];
  folderPath?: string;
  server?: (string | DocumentServerType)[];
}
