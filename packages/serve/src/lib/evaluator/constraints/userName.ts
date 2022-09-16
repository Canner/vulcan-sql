import { AuthUserInfo } from '@vulcan-sql/serve/models';
import { AuthConstraint } from './base';
import { getRegexpFromWildcardPattern } from './helpers';

export class UserNameConstrain implements AuthConstraint {
  constructor(private nameRule: string) {}

  public evaluate(user: AuthUserInfo): boolean {
    return getRegexpFromWildcardPattern(this.nameRule).test(user.name);
  }
}
