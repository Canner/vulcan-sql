import { DockerPackager, DockerCatalogPackager } from './dockerPackager';
import { NodePackager, NodeCatalogPackager } from './nodePackager';

export * from './nodePackager';
export * from './dockerPackager';

export const builtInPackager = [
  NodePackager,
  DockerPackager,
  NodeCatalogPackager,
  DockerCatalogPackager,
];
