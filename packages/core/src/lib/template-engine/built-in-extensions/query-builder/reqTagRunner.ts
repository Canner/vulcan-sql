import { TYPES } from '@vulcan/core/containers';
import { IExecutor } from '@vulcan/core/data-query';
import { inject } from 'inversify';
import { TagRunnerOptions, TagRunner } from '../../extension-loader';
import { FINIAL_BUILDER_NAME } from './constants';

export class ReqTagRunner extends TagRunner {
  public tags = ['req'];
  private executor: IExecutor;

  constructor(@inject(TYPES.Executor) executor: IExecutor) {
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
