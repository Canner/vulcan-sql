import { TYPES } from '@vulcan-sql/core/types';
import { IExecutor } from '@vulcan-sql/core/data-query';
import { inject } from 'inversify';
import {
  TagRunner,
  TagRunnerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { FINIAL_BUILDER_NAME, PARAMETERIZER_VAR_NAME } from './constants';
import { Parameterizer } from '@vulcan-sql/core/data-query';
import { InternalError } from '../../../utils/errors';

@VulcanInternalExtension()
export class ReqTagRunner extends TagRunner {
  public tags = ['req'];
  private executor: IExecutor;

  constructor(
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) name: string,
    @inject(TYPES.Executor) executor: IExecutor
  ) {
    super(config, name);
    this.executor = executor;
  }

  public async run({ context, args, contentArgs, metadata }: TagRunnerOptions) {
    const name = String(args[0]);
    const profileName = metadata.getProfileName();
    if (!profileName) throw new InternalError(`No profile name found`);

    const parameterizer = new Parameterizer((param) =>
      this.executor.prepare({ ...param, profileName })
    );
    // parameterizer from parent, we should set it back after rendered our context.
    const parentParameterizer = context.lookup(PARAMETERIZER_VAR_NAME);
    context.setVariable(PARAMETERIZER_VAR_NAME, parameterizer);
    let query = '';
    for (let index = 0; index < contentArgs.length; index++) {
      query += await contentArgs[index]();
    }
    query = query
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');

    const builder = await this.executor.createBuilder(
      profileName,
      query,
      parameterizer
    );
    context.setVariable(name, builder);

    if (args[1] === 'true') {
      context.setVariable(FINIAL_BUILDER_NAME, builder);
      context.addExport(FINIAL_BUILDER_NAME);
    }

    // Set parameter back for upstream usage
    context.setVariable(PARAMETERIZER_VAR_NAME, parentParameterizer);
  }
}
