import {
  FunctionalFilter,
  InternalError,
  createFilterExtension,
} from '@vulcan-sql/core';

import axios from 'axios';

export const RestApiCallerFilter: FunctionalFilter = async ({
  args,
  value,
}) => {
  if (!args['url']) throw new InternalError('url is required');

  const url = args['arg'] && args['arg'] === ':id' ? `${args['url']}/${value}` : args['url'];
  const httpMethod = args['method'] || 'get';
  let options: any = {
    url: url,
    method: httpMethod,
    params: args['arg'] && args['arg'] !== ':id' ? { [args['arg']]: value } : {},
  }
  if (args['body']) {
    options = {...options, body: JSON.parse(args['body'])}
  }
  if (args['headers']) {
    options = {...options, headers: JSON.parse(args['headers'])}
  }

  const results = await axios(options);

  return JSON.stringify(results.data);
};

export const [Builder, Runner] = createFilterExtension(
  'rest_api',
  RestApiCallerFilter
);
