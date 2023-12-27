import { TYPES } from '@vulcan-sql/api-layer/types';
import { IDataQueryBuilder, IExecutor } from '@vulcan-sql/api-layer/data-query';
import { inject } from 'inversify';
import {
  TagRunner,
  TagRunnerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import { FINIAL_BUILDER_NAME, PARAMETERIZER_VAR_NAME } from './constants';
import { Parameterizer } from '@vulcan-sql/api-layer/data-query';
import { InternalError } from '../../../utils/errors';
import { CACHE_MAIN_BUILDER_VAR_NAME } from '../cache/constants';

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
    // Parameterizer from parent, we should set it back after rendered our context.
    const parentParameterizer = context.lookup(PARAMETERIZER_VAR_NAME);
    context.setVariable(PARAMETERIZER_VAR_NAME, parameterizer);
    let query = '';
    for (let index = 0; index < contentArgs.length; index++) {
      query += await contentArgs[index]();
    }

    query = query
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n')
      .replace(/--.*(?:\n|$)|\/\*[\s\S]*?\*\//g, ''); // remove single-line comments and multi-line comments

    const headers = metadata.getHeaders();
    let builder: IDataQueryBuilder | undefined;
    // Replace to put the directly query cache builder to original query main builder of  "__wrapper__builder",
    // it means we can use the cache builder to execute the query directly and get result to be final result
    builder = context.lookup(CACHE_MAIN_BUILDER_VAR_NAME);
    if (builder) {
      if (headers) builder.setHeaders(headers);
      context.setVariable(name, builder);
    } else {
      builder = await this.executor.createBuilder(
        profileName,
        query,
        parameterizer,
        headers
      );
      context.setVariable(name, builder);
    }

    if (args[1] === 'true') {
      context.setVariable(FINIAL_BUILDER_NAME, builder);
      context.addExport(FINIAL_BUILDER_NAME);
    }

    // Set parameter back for upstream usage
    context.setVariable(PARAMETERIZER_VAR_NAME, parentParameterizer);
  }
}
