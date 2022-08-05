import { SQLClauseOperation } from '@vulcan-sql/core/data-query';
import { Pagination } from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { Stream } from 'stream';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

export type DataColumn = { name: string; type: string };

export interface DataResult {
  getColumns: () => DataColumn[];
  getData: () => Stream;
}

export interface ExecuteOptions {
  statement: string;
  operations: SQLClauseOperation;
  pagination?: Pagination;
}

@VulcanExtension(TYPES.Extension_DataSource, { enforcedId: true })
export abstract class DataSource extends ExtensionBase {
  abstract execute(options: ExecuteOptions): Promise<DataResult>;
}
