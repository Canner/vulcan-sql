export * from './testModeMiddleware';
import { TestModeMiddleware } from './testModeMiddleware';

// Imitate extension for testing
export default {
  validators: [],
  middlewares: [TestModeMiddleware],
};
