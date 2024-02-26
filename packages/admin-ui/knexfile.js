// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'pg',
  connection:
    process.env.PG_URL ||
    'postgres://postgres:postgres@localhost:5432/admin_ui',
};
