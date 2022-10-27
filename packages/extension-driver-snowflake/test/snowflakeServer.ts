import { SnowflakeOptions } from '../src/lib/snowflakeDataSource';

[
  'SNOWFLAKE_ACCOUNT',
  'SNOWFLAKE_USER',
  'SNOWFLAKE_PASSWORD',
  'SNOWFLAKE_WAREHOUSE',
].forEach((envName) => {
  /* istanbul ignore next */
  if (!process.env[envName]) throw new Error(`${envName} not defined`);
});
export class SnowflakeServer {
  public getProfile(name: string) {
    return {
      name,
      type: 'snowflake',
      connection: {
        account: process.env['SNOWFLAKE_ACCOUNT'],
        username: process.env['SNOWFLAKE_USER'],
        password: process.env['SNOWFLAKE_PASSWORD'],
        warehouse: process.env['SNOWFLAKE_WAREHOUSE'],
        min: 0,
        max: 3,
      } as SnowflakeOptions,
      allow: '*',
    };
  }
}
