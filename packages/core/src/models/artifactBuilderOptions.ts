export enum PersistentStoreType {
  LocalFile = 'LocalFile',
}

export enum SerializerType {
  JSON = 'JSON',
}

export interface IArtifactBuilderOptions {
  storageType: PersistentStoreType;
  path: string;
  serializerType: SerializerType;
}
