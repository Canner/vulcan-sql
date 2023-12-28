import * as nunjucks from 'nunjucks';
import { BaseCompilerEnvironment } from '../compiler-environment';

export const implementedOnAstVisit = (source: any): source is OnAstVisit => {
  return !!source.onVisit;
};

/**
 * Visit every nodes after compiling, you can extract metadata from them, or even modify some nodes.
 */
export interface OnAstVisit {
  onVisit(node: nunjucks.nodes.Node, env: BaseCompilerEnvironment): void;
  finish?: () => void;
}

export const implementedProvideMetadata = (
  source: any
): source is ProvideMetadata => {
  return !!source.metadataName && !!source.getMetadata;
};

/**
 * Providing metadata after compiling
 */
export interface ProvideMetadata {
  metadataName: string;
  getMetadata(): any;
}
