export const BuiltInArtifactKeys = {
  Templates: 'templates',
  Schemas: 'schemas',
  Specs: 'specs',
};

export interface ArtifactBuilder {
  build(): Promise<void>;
  load(): Promise<void>;
  addArtifact(key: string, data: any): void;
  getArtifact<T = any>(key: string): T;
}
