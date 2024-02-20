import { CompactTable } from '../types';

export interface IConnector<T> {
  connect(): Promise<boolean>;
  listTables(listTableOptions: any): Promise<CompactTable[] | T[]>;
}
