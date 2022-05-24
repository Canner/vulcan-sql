import { ContainerModule } from 'inversify';
import { Executor, QueryBuilder } from '@vulcan/core/template-engine';
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
