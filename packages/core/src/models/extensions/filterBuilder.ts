import { TYPES } from '@vulcan-sql/core/types';
import { VulcanExtension } from './decorators';
import { CompileTimeExtension } from './templateEngine';

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class FilterBuilder<C = any> extends CompileTimeExtension<C> {
  abstract filterName: string;
}
