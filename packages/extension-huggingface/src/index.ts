/**
 *
 * References:
 * https://github.com/jestjs/jest/issues/2071#issuecomment-259709487
 * https://nodejs.org/en/blog/release/v16.15.0
 * https://stackoverflow.com/questions/48433783/referenceerror-fetch-is-not-defined
 *
 * In the Node.js 16, fetch API is an experimental function, but huggingface.js need to use fetch API, so import the "node-fetch" package and set it, This is a workaround.
 *  */
import fetch from 'node-fetch';
globalThis.fetch = fetch as any;

// Alias the Builder and Runner from the package and export them to prevent Extension loader loading the same Builder and Runner class when creating multiple Functional Filters or Tags.
import {
  Builder as HuggingFaceTableQuestionAnsweringFilterBuilder,
  Runner as HuggingFaceTableQuestionAnsweringFilterRunner,
} from './lib/tableQuestionAnswering';

export default [
  HuggingFaceTableQuestionAnsweringFilterBuilder,
  HuggingFaceTableQuestionAnsweringFilterRunner,
];
