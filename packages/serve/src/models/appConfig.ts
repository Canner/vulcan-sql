import { ServeConfig } from './serveConfig';

export type AppConfig = Omit<ServeConfig, 'artifact' | 'template' | 'types'>;
