export enum ArtifactBuilderProviderType {
  LocalFile = 'LocalFile',
}

export enum ArtifactBuilderSerializerType {
  JSON = 'JSON',
}

export interface IArtifactBuilderOptions {
  /** The provider which provides the content of our artifacts. e.g. LocalFile provider to save built result in local disk. */
  provider: ArtifactBuilderProviderType | string;
  /** The serializer which transforms the built result (JS Object) into string or binary data. e.g. JSON serializer. */
  serializer: ArtifactBuilderSerializerType | string;
  filePath: string;
}
