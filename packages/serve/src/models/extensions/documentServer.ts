import {
  DocumentOptions,
  DocumentSpec,
  ExtensionBase,
  VulcanExtension,
} from '@vulcan-sql/core';
import { TYPES } from '@vulcan-sql/serve/types';
import { KoaContext, Next } from '@vulcan-sql/serve/models';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject } from 'inversify';
import * as fs from 'fs';
import * as path from 'path';

@VulcanExtension(TYPES.Extension_DocumentServer)
export abstract class DocumentServer<C = any> extends ExtensionBase<C> {
  private documentOptions: DocumentOptions;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.DocumentOptions) documentOptions: DocumentOptions
  ) {
    super(config, moduleName);
    this.documentOptions = documentOptions;
  }

  public abstract handle(context: KoaContext, next: Next): Promise<void>;

  protected async getSpec(type: string = DocumentSpec.oas3) {
    const filePath = path.resolve(
      this.documentOptions.folderPath,
      `spec-${type}.yaml`
    );
    if (!fs.existsSync(filePath)) throw new Error(`File ${filePath} not found`);
    return fs.createReadStream(filePath);
  }
}
