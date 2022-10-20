import { isUndefined } from 'lodash';

export interface OffsetPagination {
  limit: number;
  offset: number;
}

export function isOffsetPagination(
  pagination: Pagination
): pagination is OffsetPagination {
  return (
    pagination &&
    !isUndefined(pagination.limit) &&
    !isUndefined((pagination as any).offset)
  );
}

export interface CursorPagination {
  limit: number;
  cursor: string;
}

export interface KeysetPagination {
  limit: number;
  [keyName: string]: string | number;
}

export type Pagination = CursorPagination | OffsetPagination | KeysetPagination;
