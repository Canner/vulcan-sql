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
  const results = await axios.get<Array<any>>(args['url'], {
    params: args['arg'] ? { [args['arg']]: value } : {},
  });

  return JSON.stringify(results.data);
};

export const [Builder, Runner] = createFilterExtension(
  'rest_api',
  RestApiCallerFilter
);
