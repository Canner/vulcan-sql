import knex from 'knex';

export const createKnex = () => {
  return knex({
    client: 'better-sqlite3',
    connection: {
      filename: process.env.SQL_LITE_FILE_PATH || '.vulcan/vulcan.sqlite3',
    },
  });
};
