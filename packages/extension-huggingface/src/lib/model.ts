export type HuggingFaceOptions = {
  accessToken: string;
};

export const apiInferenceEndpoint =
  'https://api-inference.huggingface.co/models';

// For more information. See: https://huggingface.co/docs/api-inference/detailed_parameters#natural-language-processing
export type InferenceNLPOptions = {
  // Default: true. There is a cache layer on the inference API to speedup requests we have already seen. Most models can use those results as is as models are deterministic (meaning the results will be the same anyway).
  use_cache?: boolean;
  // Default: false. If the model is not ready, wait for it instead of receiving 503. It limits the number of requests required to get your inference done.
  wait_for_model?: boolean;
};
