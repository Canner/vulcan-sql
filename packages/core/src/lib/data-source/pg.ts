import { Stream } from 'stream';
import {
  BindParameters,
  DataResult,
  DataSource,
  ExecuteOptions,
  IdentifierParameters,
  RequestParameters,
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
  public async prepare(params: RequestParameters) {
    const identifiers = {} as IdentifierParameters;
    const binds = {} as BindParameters;
    let index = 1;
    for (const key of Object.keys(params)) {
      const identifier = `$${index}`;
      identifiers[key] = identifier;
      binds[identifier] = params[key];
      index += 1;
    }
    return {
      identifiers,
      binds,
    };
  }
}
