import { Request } from 'koa';

export type BodyRequest = Request & {
  body: Record<string, unknown> | undefined;
};
