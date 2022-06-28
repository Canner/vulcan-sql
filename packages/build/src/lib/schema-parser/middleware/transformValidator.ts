import { SchemaParserMiddleware } from './middleware';

// Transform validator requests
export const transformValidator =
  (): SchemaParserMiddleware => async (schemas, next) => {
    if (!schemas.request) schemas.request = [];
    for (
      let requestIndex = 0;
      requestIndex < schemas.request.length;
      requestIndex++
    ) {
      schemas.request[requestIndex].validators =
        schemas.request[requestIndex].validators?.map((validator) => {
          // 1. some-name -> {name: "some-name"}
          if (typeof validator === 'string') {
            return {
              name: validator,
              args: {},
            };
          }
          // 2. add fallback argument {}
          if (!validator.args) {
            validator.args = {};
          }
          return validator;
        }) || [];
    }

    return next();
  };
