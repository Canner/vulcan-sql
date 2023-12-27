import 'reflect-metadata';

export const EXTENSION_TYPE_METADATA_KEY = Symbol.for('extension-type');
export const EXTENSION_NAME_METADATA_KEY = Symbol.for('extension-name');
export const EXTENSION_IDENTIFIER_METADATA_KEY = Symbol.for('extension-id');
export const EXTENSION_ENFORCED_ID_METADATA_KEY = Symbol.for(
  'extension-options-enforcedId'
);

export interface VulcanExtensionOptions {
  /** Force every extension of this type to have an extension ID. */
  enforcedId?: boolean;
}

export function VulcanExtension(
  type: symbol,
  options: VulcanExtensionOptions = {}
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(EXTENSION_TYPE_METADATA_KEY, type, target);
    Reflect.defineMetadata(
      EXTENSION_ENFORCED_ID_METADATA_KEY,
      options.enforcedId || false,
      target
    );
  };
}

export function VulcanInternalExtension(moduleName?: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(
      EXTENSION_NAME_METADATA_KEY,
      moduleName || '',
      target
    );
  };
}

export function VulcanExtensionId(id: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(EXTENSION_IDENTIFIER_METADATA_KEY, id, target);
  };
}
