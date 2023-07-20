import { InternalError } from '@vulcan-sql/core';
import { HfInference } from '@huggingface/inference';

export type HuggingFaceOptions = {
  accessToken: string;
};

// Extract the creating hugging face to factory for reuse if need to add more hugging face inference task
export const createHuggingFaceInference = (options?: HuggingFaceOptions) => {
  if (!options || !options.accessToken)
    throw new InternalError('please given access token');

  // Access token will be validated when calling hugging face method, so we could not validate it when new it.
  return new HfInference(options.accessToken);
};
