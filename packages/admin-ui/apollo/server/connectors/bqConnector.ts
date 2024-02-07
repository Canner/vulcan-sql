import { CompactTable } from '../types';
import { IConnector } from './connector';
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';

export class BQConnector implements IConnector {
  private bq: BigQuery;

  constructor(bqOptions: BigQueryOptions) {
    this.bq = new BigQuery(bqOptions);
  }

  public async connect() {
    try {
      const res = await this.bq.query('SELECT 1;');
    } catch (err) {
      return false;
    }
  }

  listTables(): Promise<CompactTable[]> {
    throw new Error('Method not implemented.');
  }
}
