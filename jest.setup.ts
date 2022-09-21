/**
 * Add reflect-metadata to collect Inversify IoC decorator information when running jest test.
 */
import 'reflect-metadata';
/**
 * https://github.com/prisma/prisma/issues/8558
 * in jest 27+, we'll have some issues with setImmediate function, this is a workaround
 */
global.setImmediate =
  global.setImmediate ||
  ((fn: any, ...args: any) => global.setTimeout(fn, 0, ...args));
