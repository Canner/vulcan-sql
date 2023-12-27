import {
  FunctionalFilter,
  InternalError,
  createFilterExtension,
} from '@vulcan-sql/api-layer';
import { has, isArray, isEmpty, omit, pick } from 'lodash';
import {
  HuggingFaceOptions,
  InferenceNLPOptions,
  apiInferenceEndpoint,
} from '../model';
import { postRequest } from '../utils';

// More information described the options. See: https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
type TextGenerationOptions = {
  inputs: string;
  parameters?: {
    // Integer to define the top tokens considered within the sample operation to create new text.
    top_k?: number;
    // Float to define the tokens that are within the sample operation of text generation. Add tokens in the sample for more probable to least probable until the sum of the probabilities is greater than top_p.
    top_p?: number;
    // Default: 0.1. Range: (0.0 - 100.0). The temperature of the sampling operation. 1 means regular sampling, 0 means always take the highest score, 100.0 is getting closer to uniform probability.
    temperature?: number;
    // Range: (0.0 - 100.0). The more a token is used within generation the more it is penalized to not be picked in successive generation passes.
    repetition_penalty?: number;
    // Default: 250. The amount of new tokens to be generated, this does not include the input length it is a estimate of the size of generated text you want. Each new tokens slows down the request, so look for balance between response times and length of text generated.
    max_new_tokens?: number;
    // Range (0-120.0). The amount of time in seconds that the query should take maximum. Network can cause some overhead so it will be a soft limit. Use that in combination with max_new_tokens for best results.
    max_time?: number;
    // Default: false. If set to False, the return results will not contain the original query making it easier for prompting.
    return_full_text?: boolean;
    // Default: 1. The number of proposition you want to be returned.
    num_return_sequences?: number;
    // Whether or not to use sampling, use greedy decoding otherwise.
    do_sample?: boolean;
  };
  options?: InferenceNLPOptions;
};

/**
 * Get text generation url. Used gpt2 model be default value.
 * See: https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
 * */
const getUrl = (model = 'gpt2') => `${apiInferenceEndpoint}/${model}`;

export const TextGenerationFilter: FunctionalFilter = async ({
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

  // Convert the data result to JSON string as question context
  const context = JSON.stringify(value);
  // omit hidden value '__keywords' from args, it generated from nunjucks and not related to HuggingFace.
  const { query, model, endpoint, ...otherArgs } = omit(args, '__keywords');
  const inferenceOptions = pick(otherArgs, ['use_cache', 'wait_for_model']);
  const parameters = omit(otherArgs, ['use_cache', 'wait_for_model', 'endpoint']);
  const payload = {
    inputs: `Context: ${context}. Question: ${query}}`,
    parameters: {
      return_full_text: false,
      max_new_tokens: 250,
      temperature: 0.1,
    }
  } as TextGenerationOptions;
  if (!isEmpty(parameters)) payload.parameters = parameters;
  if (!isEmpty(inferenceOptions)) payload.options = inferenceOptions;

  try {
    // if not given endpoint, use default HuggingFace inference endpoint
    const url = endpoint ? endpoint : getUrl(model);
    const results = await postRequest(url, payload, token);
    // get the "generated_text" field, and trim leading and trailing white space.
    return String(results[0]['generated_text']).trim();
  } catch (error) {
    throw new InternalError(
      `Error when sending data to Hugging Face for executing TextGeneration tasks, details: ${
        (error as Error).message
      }`
    );
  }
};

export const [Builder, Runner] = createFilterExtension(
  'huggingface_text_generation',
  TextGenerationFilter
);
