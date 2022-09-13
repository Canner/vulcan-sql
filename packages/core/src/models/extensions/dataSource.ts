import { SQLClauseOperation } from '@vulcan-sql/core/data-query';
import { Pagination } from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { Readable } from 'stream';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

// Original request parameters
export interface RequestParameter {
  /** The index (starts from 1) of parameters, it's useful to generate parameter id like $1, $2 ...etc. */
  parameterIndex: number;
  /** The raw value (not name) */
  value: any;
}

export type BindParameters = Map<string, string>;

export type DataColumn = { name: string; type: string };

export interface DataResult {
  getColumns: () => DataColumn[];
  getData: () => Readable;
}

export interface ExecuteOptions {
  statement: string;
  operations: SQLClauseOperation;
  /** The parameter bindings, we guarantee the order of the keys in the map is the same as the order when they were used in queries. */
  bindParams: BindParameters;
  pagination?: Pagination;
}

export type PrepareParameterFunc = {
  (param: RequestParameter): Promise<string>;
};

@VulcanExtension(TYPES.Extension_DataSource, { enforcedId: true })
export abstract class DataSource<C = any> extends ExtensionBase<C> {
  abstract execute(options: ExecuteOptions): Promise<DataResult>;
  // prepare parameterized format for query later
  abstract prepare(param: RequestParameter): Promise<string>;
}
