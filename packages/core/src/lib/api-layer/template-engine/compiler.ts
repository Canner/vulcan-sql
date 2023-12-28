import {
  DataResult,
  IncomingHttpHeaders,
  KoaRequest,
} from '@vulcan-sql/core/models';
import { Pagination } from '../../../models/pagination';

export interface TemplateLocation {
  lineNo: number;
  columnNo: number;
}

export interface TemplateErrorMetadata {
  code: string;
  locations: TemplateLocation[];
}

export interface TemplateParameterMetadata {
  name: string;
  locations: TemplateLocation[];
}

export type TemplateMetadata = Record<string, any>;
export interface CompileResult {
  compiledData: string;
  metadata: TemplateMetadata;
}

export interface UserInfo {
  name: string;
  attr: Record<string, any>;
}

export interface ExecuteContext {
  parameters?: Record<string, any>;
  user?: UserInfo;
  profileName: string;
  req?: KoaRequest;
  headers?: IncomingHttpHeaders;
}

export interface Compiler {
  name: string;
  /**
   * Turn the template to compiled data. In most cases, we compile the template to some JavaScript code in order to "execute" them later.
   * @param template The path or identifier of a template source
   */
  compile(template: string): Promise<CompileResult>;
  execute(
    templateName: string,
    data: ExecuteContext,
    pagination?: Pagination
  ): Promise<DataResult>;
}
