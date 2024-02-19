import { CompactTable } from '../types';
import { IConnector } from './connector';
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';

export class BQConnector implements IConnector {
  private bq: BigQuery;

  // Not storing the bq client instance because we rarely need to use it
  constructor(bqOptions: BigQueryOptions) {
    this.bq = new BigQuery(bqOptions);
  }

  public async connect() {
    try {
      await this.bq.query('SELECT 1;');
      return true;
    } catch (err) {
      return false;
    }
  }

  listTables(): Promise<CompactTable[]> {
    throw new Error('Method not implemented.');
  }
}
