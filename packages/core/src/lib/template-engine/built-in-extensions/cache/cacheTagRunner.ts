import { TYPES } from '@vulcan-sql/core/types';
import { IExecutor } from '@vulcan-sql/core/data-query';
import { inject } from 'inversify';
import {
  TagRunner,
  TagRunnerOptions,
  VulcanInternalExtension,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core/models';
import { Parameterizer } from '@vulcan-sql/core/data-query';
import { PARAMETERIZER_VAR_NAME } from '../query-builder/constants';

@VulcanInternalExtension()
export class CacheTagRunner extends TagRunner {
  public tags = ['cache'];
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
    // Get the variable name, if the cache tag has variable name, then we use the variable and keep the builder in the variable, and make user could use by xxx.value() like the req feature.
    // However if the cache tag not has variable name, means you would like to get the result directly after query, then we will replace the original query main builder to the cache builder.
    const name = String(args[0]);

    // Use cache profile name to create prepared statement by parameterizer query
    const parameterizer = new Parameterizer((param) =>
      this.executor.prepare({ ...param, profileName: cacheProfileName })
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

    // Set the default vulcan created cache table schema, so we could query the cache table directly, not need user to type schema in the SQL.
    query = `set schema=${vulcanCacheSchemaName};`.concat('\n').concat(query);
    // Create the builder which access "vulcan.cache" data source for cache layer query
    const builder = await this.executor.createBuilder(
      cacheProfileName,
      query,
      parameterizer
    );
    context.setVariable(name, builder);
    // pass header to builder
    const headers = metadata.getHeaders();
    if (headers) builder.setHeaders(headers);

    // Set parameter back for upstream usage
    context.setVariable(PARAMETERIZER_VAR_NAME, parentParameterizer);
  }
}
