import { ExtensionBase, VulcanExtension } from '@vulcan-sql/core';
import { TYPES } from '../../../containers/types';
import { promises as fs } from 'fs';
import * as path from 'path';
import { IBuildOptions } from '../../buildOptions';

export enum PackagerType {
  Node = 'node',
  Docker = 'docker',
}

export enum PackagerTarget {
  VulcanServer = 'vulcan-server',
  CatalogServer = 'catalog-server',
}

export interface PackagerOptions {
  output: PackagerType | string;
  target: PackagerTarget | string;
}

export const PackagerName = {
  Node: `${PackagerType.Node}_${PackagerTarget.VulcanServer}`,
  NodeCatalog: `${PackagerType.Node}_${PackagerTarget.CatalogServer}`,
  Docker: `${PackagerType.Docker}_${PackagerTarget.VulcanServer}`,
  DockerCatalog: `${PackagerType.Docker}_${PackagerTarget.CatalogServer}`,
};

export interface PackagerConfig {
  [PackagerTarget.VulcanServer]?: {
    folderPath?: string;
  };
  [PackagerTarget.CatalogServer]?: {
    folderPath?: string;
  };
}

@VulcanExtension(TYPES.Extension_Packager, { enforcedId: true })
export abstract class Packager<C = PackagerConfig> extends ExtensionBase<C> {
  abstract package(options: IBuildOptions): Promise<void>;

  protected async getPackageJson() {
    const packageJson: Record<string, any> = {};
    const projectPackageJson = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf-8')
    );

    packageJson['dependencies'] = projectPackageJson['dependencies'];
    packageJson['main'] = 'index.js';

    // remove catalog-server
    delete packageJson['dependencies']['@vulcan-sql/catalog-server'];

    return packageJson;
  }

  protected async getCatalogPackageJson() {
    const packageJson: Record<string, any> = {};
    const projectPackageJson = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf-8')
    );

    packageJson['dependencies'] = projectPackageJson['dependencies'];
    packageJson['main'] = 'index.js';

    // remove all dependencies except catalog-server
    for (const key in packageJson['dependencies']) {
      if (key !== '@vulcan-sql/catalog-server') {
        delete packageJson['dependencies'][key];
      }
    }

    return packageJson;
  }

  protected async getEntryJS() {
    return fs.readFile(path.resolve(__dirname, 'assets', 'entry.js'), 'utf-8');
  }

  protected async getCatalogEntryJS() {
    return fs.readFile(
      path.resolve(__dirname, 'assets', 'catalogEntry.js'),
      'utf-8'
    );
  }
}
