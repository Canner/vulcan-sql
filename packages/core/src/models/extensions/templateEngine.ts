import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';
import * as nunjucks from 'nunjucks';
import { TYPES } from '@vulcan-sql/core/types';

export type TemplateEngineExtension = RuntimeExtension | CompileTimeExtension;

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class RuntimeExtension<C = any> extends ExtensionBase<C> {}

@VulcanExtension(TYPES.Extension_TemplateEngine)
export abstract class CompileTimeExtension<C = any> extends ExtensionBase<C> {
  // AST visitor
  public onVisit?(node: nunjucks.nodes.Node): void;
  public finish?(): void;
  // Metadata provider
  public metadataName?: string;
  public getMetadata?(): any;
}
