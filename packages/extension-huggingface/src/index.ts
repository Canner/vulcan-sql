// Alias the Builder and Runner from the package and export them to prevent Extension loader loading the same Builder and Runner class when creating multiple Functional Filters or Tags.
import {
  Builder as HuggingFaceTableQuestionAnsweringFilterBuilder,
  Runner as HuggingFaceTableQuestionAnsweringFilterRunner,
} from './lib/filters/tableQuestionAnswering';

import {
  Builder as HuggingFaceTextGenerationFilterBuilder,
  Runner as HuggingFaceTextGenerationFilterRunner,
} from './lib/filters/textGeneration';

export default [
  HuggingFaceTableQuestionAnsweringFilterBuilder,
  HuggingFaceTableQuestionAnsweringFilterRunner,
  HuggingFaceTextGenerationFilterBuilder,
  HuggingFaceTextGenerationFilterRunner,
];
