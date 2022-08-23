export enum DocumentSpec {
  oas3 = 'oas3',
}

export interface IDocumentOptions {
  /** Target specification of our APIs, e.g. OpenAPI, Tinyspec ...etc. */
  specs?: (string | DocumentSpec)[];
  folderPath?: string;
}
