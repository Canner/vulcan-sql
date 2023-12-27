import { ExtensionBase, VulcanExtension } from '@vulcan-sql/api-layer';
import { TYPES } from '../../containers/types';

export enum SchemaFormat {
  YAML = 'YAML',
}

export interface SchemaData {
  /** The identifier of this schema, we might use this name to mapping SQL sources. */
  sourceName: string;
  content: string;
  type: SchemaFormat;
}

@VulcanExtension(TYPES.Extension_SchemaReader, { enforcedId: true })
export abstract class SchemaReader<C = any> extends ExtensionBase<C> {
  abstract readSchema(): AsyncGenerator<SchemaData>;
}
