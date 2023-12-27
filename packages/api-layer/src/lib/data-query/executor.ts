import {
  DataSource,
  IncomingHttpHeaders,
  PrepareParameterFunc,
  RequestParameter,
} from '@vulcan-sql/api-layer/models';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { DataQueryBuilder, IDataQueryBuilder } from './builder';
import { IParameterizer } from './parameterizer';

export interface IExecutor {
  createBuilder(
    profileName: string,
    query: string,
    parameterizer: IParameterizer,
    headers?: IncomingHttpHeaders
  ): Promise<IDataQueryBuilder>;
  prepare: PrepareParameterFunc;
}

@injectable()
export class QueryExecutor implements IExecutor {
  private dataSourceFactory: interfaces.SimpleFactory<DataSource>;

  constructor(
    @inject(TYPES.Factory_DataSource)
    dataSourceFactory: interfaces.SimpleFactory<DataSource>
  ) {
    this.dataSourceFactory = dataSourceFactory;
  }

  public async prepare(request: RequestParameter) {
    return this.dataSourceFactory(request.profileName)!.prepare(request);
  }

  /**
   * create data query builder
   * @returns
   */
  public async createBuilder(
    profileName: string,
    query: string,
    parameterizer: IParameterizer,
    headers?: IncomingHttpHeaders
  ) {
    return new DataQueryBuilder({
      statement: query,
      parameterizer,
      dataSource: this.dataSourceFactory(profileName)!,
      profileName,
      headers: headers || {},
    });
  }
}
