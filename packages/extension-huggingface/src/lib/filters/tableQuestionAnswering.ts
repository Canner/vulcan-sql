import {
  FunctionalFilter,
  InternalError,
  createFilterExtension,
} from '@vulcan-sql/core';

import { convertToHuggingFaceTable, postRequest } from '../utils';
import { has, isArray, isEmpty, omit } from 'lodash';
import {
  InferenceNLPOptions,
  HuggingFaceOptions,
  apiInferenceEndpoint,
} from '../model';

// More information described the options. See: https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task
type TableQuestionAnsweringOptions = {
  inputs: {
    query: string;
    table: Record<string, string[]>;
  };
  options?: InferenceNLPOptions;
};

/**
 * Get table question answering url. Used recommend model be default value.
 * See: https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task
 * */
const getUrl = (model = 'google/tapas-base-finetuned-wtq') =>
  `${apiInferenceEndpoint}/${model}`;

export const TableQuestionAnsweringFilter: FunctionalFilter = async ({
  args,
  value,
  options,
}) => {
  const token = (options as HuggingFaceOptions)?.accessToken;
  if (!token) throw new InternalError('please given access token');

  if (!isArray(value))
    throw new InternalError('Input value must be an array of object');
  if (!(typeof args === 'object') || !has(args, 'query'))
    throw new InternalError('Must provide "query" keyword argument');
  if (!args['query'])
    throw new InternalError('The "query" argument must have value');

  // Convert the data result format to table value format
  const table = convertToHuggingFaceTable(value);
  // omit hidden value '__keywords' from args, it generated from nunjucks and not related to HuggingFace.
  const { query, model, endpoint, ...inferenceOptions } = omit(args, '__keywords');
  const payload = {
    inputs: { query, table },
  } as TableQuestionAnsweringOptions;
  if (!isEmpty(inferenceOptions)) payload.options = inferenceOptions;

  try {
    const url = endpoint ? endpoint : getUrl(model);
    const results = await postRequest(url, payload, token);
    // convert to JSON string to make user get the whole result after parsing it in SQL
    return JSON.stringify(results);
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
