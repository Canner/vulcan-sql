/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('relation', (table) => {
    table.increments('id').comment('ID');
    table.integer('project_id').comment('Reference to project.id');
    table.string('name').comment('relation name');
    table
      .string('join_type')
      .comment('join type, eg:"ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE"');
    table
      .text('condition')
      .comment(
        'join condition, ex: "OrdersModel.custkey = CustomerModel.custkey"'
      );
    table
      .integer('left_column_id')
      .comment(
        'left column id, "{leftSideColumn} {joinType} {rightSideColumn}"'
      );
    table
      .string('left_column_name')
      .comment(
        'the column name used in MDL, eg:"orders: Orders[] @relation(OrdersCustomer)"'
      );

    table
      .integer('right_column_id')
      .comment(
        'right column id, "{leftSideColumn} {joinType} {rightSideColumn}"'
      );
    table
      .string('right_column_name')
      .comment(
        'the column name used in MDL, eg:"customer: Customer @relation(OrdersCustomer)"'
      );
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('relation');
};
