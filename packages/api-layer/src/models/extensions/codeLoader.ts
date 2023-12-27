import { TYPES } from '@vulcan-sql/api-layer/types';
import * as nunjucks from 'nunjucks';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

@VulcanExtension(TYPES.Extension_CompilerLoader)
export abstract class CodeLoader extends ExtensionBase {
  abstract setSource(name: string, code: string): void;
  abstract getSource(name: string): nunjucks.LoaderSource | null;
}
