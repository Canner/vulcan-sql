export enum DocumentGeneratorSpec {
  oas3 = 'oas3',
}

export interface IDocumentGeneratorOptions {
  /** Target specification of our APIs, e.g. OpenAPI, Tinyspec ...etc. */
  specs?: (string | DocumentGeneratorSpec)[];
  folderPath: string;
}
