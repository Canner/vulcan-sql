import { IExecutor, QueryExecutor } from '@vulcan-sql/api-layer/data-query';
import { AsyncContainerModule } from 'inversify';
import { TYPES } from '../types';
import 'reflect-metadata';

export const executorModule = () =>
  new AsyncContainerModule(async (bind) => {
    // Executor
    bind<IExecutor>(TYPES.Executor).to(QueryExecutor);
  });
