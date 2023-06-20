require('@vulcan-sql/build');
require('@vulcan-sql/core');
require('@vulcan-sql/serve');
require('@vulcan-sql/extension-dbt');
require('@vulcan-sql/extension-driver-bq');
require('@vulcan-sql/extension-driver-duckdb');
require('@vulcan-sql/extension-driver-pg');
require('@vulcan-sql/extension-driver-snowflake');

// entry
require('@vulcan-sql/cli/src/binEntry');
