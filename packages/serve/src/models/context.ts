import { Next } from 'koa';
import { RouterContext } from 'koa-router';
import { AuthUserInfo } from './extensions/authenticator';

type KoaContext = RouterContext<{ user: AuthUserInfo }>;

export { KoaContext, Next };
