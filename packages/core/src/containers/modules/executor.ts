import { ContainerModule } from 'inversify';
// TODO: Should replace with a real implementation
import {
  QueryBuilder,
  Executor,
} from '../../lib/template-engine/built-in-extensions/query-builder/reqTagRunner';
import { TYPES } from '../types';

class MockBuilder implements QueryBuilder {
  public count() {
    return this;
  }

  public async value() {
    return [];
  }
}

export const executorModule = () =>
  new ContainerModule((bind) => {
    bind<Executor>(TYPES.Executor).toConstantValue({
      // TODO: Mock value
      createBuilder: async () => new MockBuilder(),
    });
  });
