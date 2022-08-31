import { DataQueryBuilder } from '@vulcan-sql/core/data-query';
import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { Readable } from 'stream';
import { EXECUTE_FILTER_NAME } from './constants';

@VulcanInternalExtension()
export class ExecutorRunner extends FilterRunner {
  public filterName = EXECUTE_FILTER_NAME;

  public async transform({
    value: builder,
  }: FilterRunnerTransformOptions): Promise<any> {
    // if input value is not query builder, call the function .value and to nothing.
    if (!(builder instanceof DataQueryBuilder)) return builder.value();

    const { getData } = await builder.value();
    const dataStream = getData();
    const data = this.downloadStream(dataStream);
    return data;
  }

  private async downloadStream(stream: Readable) {
    const rows: any[] = [];
    return new Promise<any[]>((resolve, reject) => {
      stream.on('data', (data) => {
        rows.push(data);
      });
      stream.on('end', () => {
        resolve(rows);
      });
      stream.on('error', (err) => reject(err));
    });
  }
}
