/* eslint-disable @typescript-eslint/no-unused-vars */
import { Parameterized, SQLClauseOperation } from '@vulcan-sql/core/data-query';
import {
  CacheLayerStoreFormatType,
  IncomingHttpHeaders,
  Profile,
} from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { inject, multiInject, optional } from 'inversify';
import { Readable } from 'stream';
import { InternalError } from '../../lib/utils/errors';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

export interface ExportOptions {
  // The sql query result to export
  sql: string;
  // The directory to export result to file
  directory: string;
  // The profile name to select to export data
  profileName: string;
  // data source options
  options?: any;
  // export file format type
  type: CacheLayerStoreFormatType | string;
}
export interface ImportOptions {
  // The table name to create from imported file data
  tableName: string;
  // The directory to import cache files
  directory: string;
  // The profile name to select to import data
  profileName: string;
  // default schema
  schema: string;
  // import file format type
  type: CacheLayerStoreFormatType | string;
  // table indexing, index key name -> index column
  indexes?: Record<string, string>;
}

// Original request parameters
export interface RequestParameter {
  /** The index (starts from 1) of parameters, it's useful to generate parameter id like $1, $2 ...etc. */
  parameterIndex: number;
  /** The raw value (not name) */
  value: any;
  profileName: string;
}

export type BindParameters = Map<string, string>;

export type DataColumn = { name: string; type: string };

export interface DataResult {
  getColumns: () => DataColumn[];
  getData: () => Readable;
}

export interface ExecuteOptions {
  statement: string;
  /** For core version >= 0.3.0, operations.limit and operation.offset must be handled */
  operations: Partial<Parameterized<SQLClauseOperation>>;
  /** The parameter bindings, we guarantee the order of the keys in the map is the same as the order when they were used in queries. */
  bindParams: BindParameters;
  profileName: string;
  headers?: IncomingHttpHeaders;
}

export type PrepareParameterFunc = {
  (param: RequestParameter): Promise<string>;
};

@VulcanExtension(TYPES.Extension_DataSource, { enforcedId: true })
export abstract class DataSource<
  C = any,
  PROFILE = Record<string, any>
> extends ExtensionBase<C> {
  private profiles: Map<string, Profile<PROFILE>>;

  constructor(
    @inject(TYPES.ExtensionConfig) config: C,
    @inject(TYPES.ExtensionName) moduleName: string,
    @multiInject(TYPES.Profile) @optional() profiles: Profile[] = []
  ) {
    super(config, moduleName);
    this.profiles = profiles.reduce(
      (prev, curr) => prev.set(curr.name, curr),
      new Map()
    );
  }

  abstract execute(options: ExecuteOptions): Promise<DataResult>;

  // prepare parameterized format for query later
  abstract prepare(param: RequestParameter): Promise<string>;

  /**
   * Export query result data to cache file for cache layer loader used
   */
  public export(options: ExportOptions): Promise<void> {
    throw new Error(`Export method not implemented`);
  }

  /**
   * Import data to create table from cache file for cache layer loader used
   */
  public import(options: ImportOptions): Promise<void> {
    throw new Error(`import method not implemented`);
  }

  /** Get all the profiles which belong to this data source */
  protected getProfiles() {
    return this.profiles;
  }

  protected getProfile(name: string): Profile<PROFILE> {
    const profile = this.profiles.get(name);
    if (!profile)
      throw new InternalError(
        `Profile name ${name} not found in data source ${this.getExtensionId()}`
      );
    return profile;
  }
}
