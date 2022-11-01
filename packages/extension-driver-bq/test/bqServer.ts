import { BigQueryOptions } from '@google-cloud/bigquery';

['BQ_CLIENT_EMAIL', 'BQ_PRIVATE_KEY', 'BQ_LOCATION', 'BQ_PROJECT_ID'].forEach(
  (envName) => {
    /* istanbul ignore next */
    if (!process.env[envName]) throw new Error(`${envName} not defined`);
  }
);
export class BQflakeServer {
  public getProfile(name: string) {
    return {
      name,
      type: 'bq',
      location: process.env['BQ_LOCATION'],
      connection: {
        projectId: process.env['BQ_PROJECT_ID'],
        credentials: {
          client_email: process.env['BQ_CLIENT_EMAIL'],
          private_key: process.env['BQ_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
        },
      } as BigQueryOptions,
      allow: '*',
    };
  }
}
