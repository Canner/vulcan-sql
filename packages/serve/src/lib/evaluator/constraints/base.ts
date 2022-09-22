import { AuthUserInfo } from '@vulcan-sql/serve/models';

export interface AuthConstraint {
  evaluate(user: AuthUserInfo): boolean;
}
