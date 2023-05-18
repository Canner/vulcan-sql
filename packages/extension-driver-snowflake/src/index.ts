// suppress the warning message from aws-sdk: Please migrate your code to use AWS SDK for JavaScript (v3).
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

export * from './lib/snowflakeDataSource';
import { SnowflakeDataSource } from './lib/snowflakeDataSource';
export default [SnowflakeDataSource];
