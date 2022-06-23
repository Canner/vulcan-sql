import { APISchema } from '../../models';

export interface Artifact {
  schemas: APISchema[];
  templates: Record<string, string>;
}

export interface ArtifactBuilder {
  build(artifact: Artifact): Promise<void>;
  load(): Promise<Artifact>;
}
