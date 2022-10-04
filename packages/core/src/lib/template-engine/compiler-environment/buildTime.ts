import {
  CompileTimeExtension,
  ExtensionBase,
  FilterBuilder,
  TagBuilder,
  TemplateEngineExtension,
} from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { injectable, multiInject, optional } from 'inversify';
import {
  generateMetadata,
  implementedOnAstVisit,
  implementedProvideMetadata,
  OnAstVisit,
  ProvideMetadata,
  walkAst,
} from '../extension-utils';
import { BaseCompilerEnvironment } from './base';
import * as nunjucks from 'nunjucks';

/**
 * Build time environment is used when we compiling templates.
 */
@injectable()
export class BuildTimeCompilerEnvironment extends BaseCompilerEnvironment {
  private extensions: CompileTimeExtension[] = [];
  private astVisitors: OnAstVisit[] = [];
  private metadataProviders: ProvideMetadata[] = [];

  constructor(
    @multiInject(TYPES.Extension_TemplateEngine)
    @optional()
    extensions: TemplateEngineExtension[] = []
  ) {
    super();
    // We only need compile time extensions like filterBuilder, tagBuilder ...etc.
    this.extensions = extensions.filter(
      (extension) => extension instanceof CompileTimeExtension
    );
    this.loadExtensions();
  }

  public getExtensions(): ExtensionBase<any>[] {
    return this.extensions;
  }

  public traverseAst(ast: nunjucks.nodes.Node) {
    walkAst(
      ast,
      this.astVisitors.map((astVisitor) => (node: nunjucks.nodes.Node) => {
        astVisitor.onVisit(node, this);
      })
    );
    // After finished traverse, call finish() function for every single visitor
    this.astVisitors.forEach((visitor) => visitor.finish?.());
  }

  /** Get some metadata from the AST tree, e.g. the errors defined by templates.
   * It'll help use to validate templates, validate schema ...etc. */
  public getMetadata() {
    return generateMetadata(this.metadataProviders);
  }

  private loadExtensions(): void {
    this.extensions.forEach(this.loadExtension.bind(this));
  }

  private loadExtension(extension: TemplateEngineExtension) {
    // Extends
    if (extension instanceof TagBuilder) {
      this.addExtension(extension.getName(), extension);
    } else if (extension instanceof FilterBuilder) {
      this.addFilter(
        extension.filterName,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}, // We don't need to implement transform function in compile time
        true
      );
    }
    // Implement
    if (implementedOnAstVisit(extension)) {
      this.astVisitors.push(extension);
    }
    if (implementedProvideMetadata(extension)) {
      this.metadataProviders.push(extension);
    }
  }
}
