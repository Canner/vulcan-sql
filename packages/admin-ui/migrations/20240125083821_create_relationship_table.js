/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('relationship', (table) => {
    table.increments('id').comment('ID');
    table.integer('project_id').comment('Reference to project.id');
    table.string('name').comment('relation name');
    table
      .string('join_type')
      .comment('join type, eg:"MANY_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY"');
    table
      .text('condition')
      .comment(
        'join condition, ex: "OrdersModel.custkey = CustomerModel.custkey"'
      );
    table
      .integer('left_column_id')
      .comment(
        'left column id, "{leftSideColumn} {joinType} {rightSideColumn}"'
      )
      .nullable();
    table
      .integer('right_column_id')
      .comment(
        'right column id, "{leftSideColumn} {joinType} {rightSideColumn}"'
      );
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('relationship');
};
