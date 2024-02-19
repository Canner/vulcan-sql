import { IConfig } from '../config';
import { IProjectRepository } from '../repositories';

export interface IContext {
  projectRepository: IProjectRepository;
  config: IConfig;
}
