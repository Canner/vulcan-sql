import {
  FunctionalFilter,
  UserError,
  createFilterExtension,
  getLogger,
} from '@vulcan-sql/core';

import axios from 'axios';

export const RestApiCallerFilter: FunctionalFilter = async ({
  args,
  value,
}) => {
  if (!args['url']) throw new UserError('url is required');
  if (typeof value !== 'object') throw new UserError('value must be an object');

  const logger = getLogger({
    scopeName: 'CORE',
  });
  let url = args['url'];
  const httpMethod = args['method'] || 'get';

  let options: any = {
    method: httpMethod,
    url,
  }

  if ('path' in value) {
    for (const key in value['path']) {
      url = url.replace(`:${key}`, value['path'][key]);
    }
    options = {...options, url}
  }

  if ('query' in value) {
    options = {...options, params: value['query']}
  }

  if ('body' in value) {
    options = {...options, data: value['body']}
  }

  if ('headers' in value) {
    options = {...options, headers: value['headers']}
  }

  try {
    logger.info('API request:', options);
    const results = await axios(options);
    logger.info('API response:', results.data);
    return JSON.stringify(results.data);
  } catch (error: any) {
    const message = error.response
      ? `response status: ${error.response.status}, response data: ${JSON.stringify(error.response.data)}`
      : `remote server does not response. request ${JSON.stringify(error)}}`;
    throw new UserError(
      `Failed to execute API request "${url}" data, ${message}`, {
        httpCode: 500,
      }
    );
  }
};

export const [Builder, Runner] = createFilterExtension(
  'rest_api',
  RestApiCallerFilter
);
