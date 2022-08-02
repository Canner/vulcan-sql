import 'reflect-metadata';

export const EXTENSION_TYPE_METADATA_KEY = Symbol.for('extension-type');
export const EXTENSION_NAME_METADATA_KEY = Symbol.for('extension-name');

export function VulcanExtension(type: symbol): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(EXTENSION_TYPE_METADATA_KEY, type, target);
  };
}

export function VulcanInternalExtension(name?: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(EXTENSION_NAME_METADATA_KEY, name || '', target);
  };
}
