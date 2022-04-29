// TODO: Temp interface, it will be replaced with proper interface from core package
// export interface SchemaDefinition {
//   name: string;
//   url: string;
//   templateName: string;
//   request: Record<
//     string,
//     {
//       in: string;
//       description: string;
//       validator: string[];
//     }
//   >;
//   error: { code: string; message: string }[];
// }

export enum DefinitionType {
  YAML = 'YAML',
}

export interface SchemaDefinition {
  name: string;
  content: string;
  type: DefinitionType;
}

export abstract class SchemaReader {
  abstract readSchema(): AsyncGenerator<SchemaDefinition>;
}
