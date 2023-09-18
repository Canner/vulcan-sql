/* istanbul ignore file */
import { PGOptions } from '../src/lib/cannerDataSource';

['CANNER_HOST', 'CANNER_PAT', 'CANNER_WORKSPACE_SQL_NAME'].forEach(
  (envName) => {
    /* istanbul ignore next */
    if (!process.env[envName]) throw new Error(`${envName} not defined`);
  }
);
export class CannerServer {
  public getProfile(name: string) {
    return {
      name,
      type: 'canner',
      connection: {
        host: process.env['CANNER_HOST'],
        port: process.env['CANNER_PORT'] || 7432,
        user: process.env['CANNER_USER'] || 'canner',
        password: process.env['CANNER_PAT'],
        database: process.env['CANNER_WORKSPACE_SQL_NAME'],
      } as PGOptions,
      allow: '*',
      properties: {},
    };
  }
}
