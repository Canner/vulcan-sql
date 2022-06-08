import { TYPES } from '@vulcan/core/containers';
import { inject } from 'inversify';
import { TagRunnerOptions, TagRunner } from '../../extension-loader';
import { FINIAL_BUILDER_NAME } from './constants';

// TODO: temporary interface
export interface QueryBuilder {
  count(): QueryBuilder;
  value(): Promise<any>;
}

export interface Executor {
  createBuilder(query: string): Promise<QueryBuilder>;
}

export class ReqTagRunner extends TagRunner {
  public tags = ['req'];
  private executor: Executor;

  constructor(@inject(TYPES.Executor) executor: Executor) {
    super();
    this.executor = executor;
  }

  public async run({ context, args, contentArgs }: TagRunnerOptions) {
    const name = args[0];
    let query = '';
    for (let index = 0; index < contentArgs.length; index++) {
      query += await contentArgs[index]();
    }
    query = query
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');
    const builder = await this.executor.createBuilder(query);
    context.setVariable(name, builder);

    if (args[1] === 'true') {
      context.setVariable(FINIAL_BUILDER_NAME, builder);
      context.addExport(FINIAL_BUILDER_NAME);
    }
  }
}
