export const BuiltInArtifactKeys = {
  templates: 'templates',
  schemas: 'schemas',
};

export interface ArtifactBuilder {
  build(): Promise<void>;
  load(): Promise<void>;
  addArtifact(key: string, data: any): void;
  getArtifact<T = any>(key: string): T;
}
