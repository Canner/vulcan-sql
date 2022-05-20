export enum PersistentStoreType {
  LocalFile = 'LocalFile',
}

export enum SerializerType {
  JSON = 'JSON',
}

export interface IArtifactBuilderOptions {
  provider: PersistentStoreType;
  serializer: SerializerType;
  filePath: string;
}
