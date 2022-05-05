export type NunjucksCompilerExtension = NunjucksTagExtension;

export interface NunjucksTagExtension {
  name: string;
  tags: string[];
  // TODO: create interfaces for each argument
  parse(parser: any, nodes: any, lexer: any): any;
}

export function isTagExtension(
  extension: NunjucksCompilerExtension
): extension is NunjucksCompilerExtension {
  return extension.tags !== undefined || extension.parse !== undefined;
}
