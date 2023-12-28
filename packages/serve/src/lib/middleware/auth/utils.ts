import { ICoreOptions } from '@vulcan-sql/core';
import { getDocUrlPrefix } from '../../document-router/utils';

export const checkIsPublicEndpoint = (
  projectOptions: Partial<ICoreOptions>,
  currentPath: string
): boolean => {
  const docUrlPrefix = getDocUrlPrefix(projectOptions['redoc']?.url || '');
  const publicPaths = [
    '/auth/token',
    '/auth/available-types',
    `/${docUrlPrefix}`,
    `/${docUrlPrefix}/spec`,
    `/${docUrlPrefix}/redoc`,
  ];
  return publicPaths.includes(currentPath);
};
