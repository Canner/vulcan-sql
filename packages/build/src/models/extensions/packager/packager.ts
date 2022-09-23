import { ExtensionBase, VulcanExtension } from '@vulcan-sql/core';
import { TYPES } from '../../../containers/types';
import { promises as fs } from 'fs';
import * as path from 'path';
import { IBuildOptions } from '../../buildOptions';

export enum PackagerType {
  Node = 'node',
  Docker = 'docker',
}

@VulcanExtension(TYPES.Extension_Packager, { enforcedId: true })
export abstract class Packager<C = any> extends ExtensionBase<C> {
  abstract package(options: IBuildOptions): Promise<void>;

  protected async getPackageJson() {
    const packageJson: Record<string, any> = {};
    const projectPackageJson = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf-8')
    );
    packageJson['dependencies'] = projectPackageJson['dependencies'];
    packageJson['main'] = 'index.js';
    return packageJson;
  }

  protected async getEntryJS() {
    return fs.readFile(path.resolve(__dirname, 'assets', 'entry.js'), 'utf-8');
  }
}
