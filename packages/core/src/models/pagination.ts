export interface OffsetPagination {
  limit: number;
  offset: number;
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
