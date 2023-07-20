import {
  FunctionalFilter,
  InternalError,
  createFilterExtension,
} from '@vulcan-sql/core';

import {
  HuggingFaceOptions,
  createHuggingFaceInference,
  convertToHuggingFaceTable,
} from './utils';
import { isArray } from 'class-validator';
import { has } from 'lodash';

type TableQuestionAnsweringOptions = {
  model?: string;
  inputs: {
    query: string;
    table: Record<string, string[]>;
  };
};

export const TableQuestionAnsweringFilter: FunctionalFilter = async ({
  args,
  value,
  options,
}) => {
  const hf = createHuggingFaceInference(options as HuggingFaceOptions);

  if (!isArray(value))
    throw new InternalError('Input value must be an array of object');

  if (!(typeof args === 'object') || !has(args, 'query'))
    throw new InternalError('Must provide "query" keyword argument');

  if (!args['query'])
    throw new InternalError('The "query" argument must have value');

  // Convert the data result format to table value format
  const table = convertToHuggingFaceTable(value);
  const context = {
    // default recommended model, see https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task
    model: 'google/tapas-base-finetuned-wtq',
    inputs: {
      query: args['query'],
      table,
    },
  } as TableQuestionAnsweringOptions;
  // if model is specified, assign the model provided
  if (args['model']) context.model = args['model'];

  try {
    const results = await hf.tableQuestionAnswering(context);
    // result format, convert to suitable FunctionalFilter response => https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task
    if (results.aggregator === 'NONE') return results.answer;
    return results.cells.join(', ');
  } catch (error) {
    throw new InternalError(
      `Error when sending data to Hugging Face for executing TableQuestionAnswering tasks, details: ${
        (error as Error).message
      }`
    );
  }
};

export const [Builder, Runner] = createFilterExtension(
  'huggingface_table_question_answering',
  TableQuestionAnsweringFilter
);
