import { NODE_TYPE } from '../enum';
import { ERROR_TEXTS } from '../error';

export const modelFieldSelectorValidator = (_, value) => {
  if (!value)
    return Promise.reject(
      new Error(ERROR_TEXTS.ADD_CACULATED_FIELD.MODEL_FIELD.REQUIRED)
    );

  const lastValue = value[value.length - 1];
  if (lastValue.nodeType !== NODE_TYPE.FIELD) {
    return Promise.reject(
      new Error(ERROR_TEXTS.ADD_CACULATED_FIELD.MODEL_FIELD.REQUIRED)
    );
  }

  return Promise.resolve();
};
