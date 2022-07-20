import { SQLClauseOperation } from '@vulcan-sql/core/data-query';
import { Pagination } from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { Stream } from 'stream';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

// Original request parameters
export interface RequestParameters {
  [name: string]: any;
}

export type BindParameters = {
  // the value is real param data
  [identifier: string]: string;
};

export type IdentifierParameters = {
  // the value is identifier
  [paramName: string]: string;
};

// prepared query parameters for providing data source to prevent sql
export interface PreparedQueryParams {
  // e.g: params['members'] = '@members'
  identifiers: IdentifierParameters;
  // e.g: binds['@members'] = '17'
  binds: BindParameters;
}

export type DataColumn = { name: string; type: string };

export interface DataResult {
  getColumns: () => DataColumn[];
  getData: () => Stream;
}

export interface ExecuteOptions {
  statement: string;
  operations: SQLClauseOperation;
  bindParams: BindParameters;
  pagination?: Pagination;
}

@VulcanExtension(TYPES.Extension_DataSource, { enforcedId: true })
export abstract class DataSource extends ExtensionBase {
  abstract execute(options: ExecuteOptions): Promise<DataResult>;
  // prepare parameterized format for query in the later
  abstract prepare(params: RequestParameters): Promise<PreparedQueryParams>;
}
