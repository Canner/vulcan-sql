import { BigQueryOptions } from '@google-cloud/bigquery';

[
  'BQ_CLIENT_EMAIL',
  'BQ_PRIVATE_KEY',
  'BQ_LOCATION',
  'BQ_PROJECT_ID',
  'GCS_BUCKET_NAME',
].forEach((envName) => {
  /* istanbul ignore next */
  if (!process.env[envName]) throw new Error(`${envName} not defined`);
});
export class BQflakeServer {
  public getProfile(name: string) {
    return {
      name,
      type: 'bq',
      connection: {
        location: process.env['BQ_LOCATION'],
        projectId: process.env['BQ_PROJECT_ID'],
        credentials: {
          client_email: process.env['BQ_CLIENT_EMAIL'],
          private_key: process.env['BQ_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
        },
      } as BigQueryOptions,
      cache: {
        bucketName: process.env['GCS_BUCKET_NAME'],
      },
      allow: '*',
    };
  }
}
