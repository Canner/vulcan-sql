import { IConfig } from '../config';
import {
  IModelColumnRepository,
  IModelRepository,
  IProjectRepository,
  IRelationRepository,
} from '../repositories';
import { IProjectService } from '../services/projectService';

export interface IContext {
  config: IConfig;

  // services
  projectService: IProjectService;

  // repository
  projectRepository: IProjectRepository;
  modelRepository: IModelRepository;
  modelColumnRepository: IModelColumnRepository;
  relationRepository: IRelationRepository;
}
