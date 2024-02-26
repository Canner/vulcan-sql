export const bootstrapKnex = (pgUrl: string, debug: boolean) => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  return require('knex')({
    client: 'pg',
    connection: pgUrl,
    debug,
    pool: { min: 2, max: 10 },
  });
};
