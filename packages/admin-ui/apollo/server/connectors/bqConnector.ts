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

  public async listTables(listTableOptions: { dataset: string }): Promise<any> {
    const { dataset } = listTableOptions;
    console.log({ dataset });
    // list columns from INFORMATION_SCHEMA ref: https://cloud.google.com/bigquery/docs/information-schema-columns
    const columns = await new Promise((resolve, reject) => {
      this.bq.query(
        `SELECT * FROM \`${dataset}\`.INFORMATION_SCHEMA.COLUMNS ORDER BY table_name, ordinal_position;`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // transform rows to CompactTable
            resolve(rows);
          }
        }
      );
    });
    return this.formatToCompactTable(columns);
  }

  private formatToCompactTable(columns: any): CompactTable[] {
    return columns.reduce((acc: CompactTable[], row: any) => {
      let table = acc.find((t) => t.name === row.table_name);
      if (!table) {
        table = {
          name: row.table_name,
          columns: [],
        };
        acc.push(table);
      }
      table.columns.push({
        name: row.column_name,
        type: row.data_type,
      });
      return acc;
    }, []);
  }
}
