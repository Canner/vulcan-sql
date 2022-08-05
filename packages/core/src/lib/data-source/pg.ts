import { Stream } from 'stream';
import {
  DataResult,
  DataSource,
  ExecuteOptions,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '../../models/extensions';

@VulcanInternalExtension()
@VulcanExtensionId('pg')
export class PGDataSource extends DataSource {
  public async execute(options: ExecuteOptions): Promise<DataResult> {
    return {
      getColumns: () => {
        return [];
      },
      getData: () => {
        return new Stream();
      },
    };
  }
}
