import { Evaluator } from '@vulcan-sql/serve/evaluator';
import { AsyncContainerModule } from 'inversify';
import { TYPES } from '../types';

export const evaluationModule = () =>
  new AsyncContainerModule(async (bind) => {
    bind<Evaluator>(TYPES.Evaluator).to(Evaluator).inSingletonScope();
  });
