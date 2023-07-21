import {
  FunctionalFilter,
  InternalError,
  createFilterExtension,
} from '@vulcan-sql/core';
import axios, { AxiosError } from 'axios';
import { convertToHuggingFaceTable } from '../utils';
import { isArray } from 'class-validator';
import { has } from 'lodash';

type HuggingFaceOptions = {
  accessToken: string;
};

// More information described the options, see: https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task
type TableQuestionAnsweringOptions = {
  inputs: {
    query: string;
    table: Record<string, string[]>;
  };
  options: {
    use_cache: boolean;
    wait_for_model: boolean;
  };
};

const request = async (url: string, data: any, token: string) => {
  try {
    const result = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    // https://axios-http.com/docs/handling_errors
    // if response has error, throw the response error, or throw the request error
    if (axiosError.response)
      throw new Error(JSON.stringify(axiosError.response?.data));
    throw new Error(axiosError.message);
  }
};

// default recommended model, see https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task
const getUrl = (model = 'google/tapas-base-finetuned-wtq') =>
  `https://api-inference.huggingface.co/models/${model}`;

export const TableQuestionAnsweringFilter: FunctionalFilter = async ({
  args,
  value,
  options,
}) => {
  if (!options || !(options as HuggingFaceOptions).accessToken)
    throw new InternalError('please given access token');

  if (!isArray(value))
    throw new InternalError('Input value must be an array of object');

  if (!(typeof args === 'object') || !has(args, 'query'))
    throw new InternalError('Must provide "query" keyword argument');
  if (!args['query'])
    throw new InternalError('The "query" argument must have value');

  const token = (options as HuggingFaceOptions).accessToken;
  // Convert the data result format to table value format
  const table = convertToHuggingFaceTable(value);
  const context = {
    inputs: {
      query: args['query'],
      table,
    },
    options: {
      use_cache: args['use_cache'] ? args['use_cache'] : true,
      wait_for_model: args['wait_for_model'] ? args['wait_for_model'] : false,
    },
  } as TableQuestionAnsweringOptions;

  // Get table question answering url
  const url = args['model'] ? getUrl(args['model']) : getUrl();

  try {
    const results = await request(url, context, token);
    // result format, convert to suitable FunctionalFilter response => https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task
    if (!results.aggregator || results.aggregator === 'NONE')
      // trim the beginning & ending space if model returned answer exist the space, e.g: ' hello world'
      return (results.answer as string).trim();
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
