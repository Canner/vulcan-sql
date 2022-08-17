import { TYPES } from '@vulcan-sql/core/types';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

export interface Template {
  name: string;
  statement: string;
}

@VulcanExtension(TYPES.Extension_TemplateProvider, { enforcedId: true })
export abstract class TemplateProvider<C = any> extends ExtensionBase<C> {
  abstract getTemplates(): AsyncGenerator<Template>;
}
