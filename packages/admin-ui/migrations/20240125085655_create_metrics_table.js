/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('metrics', (table) => {
    table.increments('id').comment('ID');
    table.integer('project_id').comment('Reference to project.id');
    table.string('name').comment('metric name');
    table.string('type').comment('metric type, ex: "simple" or "cumulative"');

    // cache setting
    table.boolean('cached').comment('model is cached or not');
    table
      .string('refresh_time')
      .comment(
        'contain a number followed by a time unit (ns, us, ms, s, m, h, d). For example, "2h"'
      )
      .nullable();

    // metric can based on model or another metrics
    table.integer('model_id').comment('Reference to model.id').nullable();
    table.integer('metric_id').comment('Reference to metric.id').nullable();
    table
      .text('properties')
      .comment(
        'metrics properties, a json string, the description should be stored here'
      )
      .nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('metrics');
};
