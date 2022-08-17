export enum DocumentGeneratorSpec {
  oas3 = 'oas3',
}

export interface IDocumentGeneratorOptions {
  specs?: (string | DocumentGeneratorSpec)[];
  folderPath: string;
}
