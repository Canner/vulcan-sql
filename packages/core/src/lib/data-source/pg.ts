import { Readable } from 'stream';
import {
  DataResult,
  DataSource,
  ExecuteOptions,
  RequestParameter,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '../../models/extensions';

@VulcanInternalExtension()
@VulcanExtensionId('pg')
export class PGDataSource extends DataSource {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(options: ExecuteOptions): Promise<DataResult> {
    return {
      getColumns: () => {
        return [];
      },
      getData: () => {
        return new Readable();
      },
    };
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }
}
