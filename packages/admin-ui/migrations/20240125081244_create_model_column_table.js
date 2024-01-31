/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('model_column', (table) => {
    table.increments('id').comment('ID');
    table.integer('model_id').comment('Reference to model ID');
    // column name
    table.boolean('is_calculated').comment('Is calculated field');
    table.string('name').comment('Column name');
    table
      .text('expression')
      .comment(
        'Expression for the column, could be custom field or calculated field expression'
      )
      .nullable();
    table
      .string('type')
      .comment('Data type, refer to the column type in the datasource');
    table.boolean('not_null').comment('Is not null');
    // is primary key
    table.boolean('is_pk').comment('Is primary key of the table');
    table
      .text('properties')
      .comment(
        'column properties, a json string, the description should be stored here'
      )
      .nullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('model_column');
};
