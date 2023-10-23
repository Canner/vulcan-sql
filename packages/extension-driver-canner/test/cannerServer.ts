/* istanbul ignore file */

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
        host: process.env['CANNER_HOST'] || '127.0.0.1',
        port: process.env['CANNER_PORT'] || 8081,
        user: process.env['CANNER_USER'] || 'canner',
        password: process.env['CANNER_PAT'] || '',
        database: process.env['CANNER_WORKSPACE_SQL_NAME'] || '',
      },
      allow: '*',
      properties: {},
    };
  }
}
