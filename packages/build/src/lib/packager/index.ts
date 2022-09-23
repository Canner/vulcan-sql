import { DockerPackager } from './dockerPackager';
import { NodePackager } from './nodePackager';

export * from './nodePackager';
export * from './dockerPackager';

export const builtInPackager = [NodePackager, DockerPackager];
