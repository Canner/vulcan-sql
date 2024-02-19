import { CompactTable } from '../types';

export interface IConnector {
  connect(): Promise<boolean>;
  listTables(listTableOptions: any): Promise<CompactTable[]>;
}
