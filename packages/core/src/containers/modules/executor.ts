import { IExecutor, QueryExecutor } from '@vulcan-sql/core/data-query';
import { AsyncContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';
import { DataSource } from '../../models/extensions';
import { IExecutorOptions } from '../../models';
import { ExecutorOptions } from '../../options';

export const executorModule = (options: IExecutorOptions = {}) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IExecutorOptions>(TYPES.ExecutorInputOptions).toConstantValue(options);
    bind<IExecutorOptions>(TYPES.ExecutorOptions).to(ExecutorOptions);

    // Data source
    bind<interfaces.AutoNamedFactory<DataSource>>(
      TYPES.Factory_DataSource
    ).toAutoNamedFactory(TYPES.Extension_DataSource);
    bind<DataSource>(TYPES.DataSource).toDynamicValue((context) => {
      const factory = context.container.get<
        interfaces.AutoNamedFactory<DataSource>
      >(TYPES.Factory_DataSource);
      const options = context.container.get<ExecutorOptions>(
        TYPES.ExecutorOptions
      );
      return factory(options.type);
    });

    // Executor
    bind<IExecutor>(TYPES.Executor).to(QueryExecutor);
  });
