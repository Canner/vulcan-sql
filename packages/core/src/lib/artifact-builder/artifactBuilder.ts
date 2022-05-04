import { APISchema } from '../../models';

export interface Artifact {
  compiler: string;
  schemas: APISchema[];
  templates: Record<string, string>;
}

export interface ArtifactBuilder {
  build(artifact: Artifact): Promise<void>;
  load(): Promise<Artifact>;
}
