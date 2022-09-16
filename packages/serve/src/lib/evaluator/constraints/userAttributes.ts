import { AuthUserInfo } from '@vulcan-sql/serve/models';
import { AuthConstraint } from './base';
import { getRegexpFromWildcardPattern } from './helpers';

export class UserAttributesConstrain implements AuthConstraint {
  constructor(private attributes: Record<string, any>) {}

  public evaluate(user: AuthUserInfo): boolean {
    // user should have all attribute to pass the evaluation.
    // allow:
    //   attributes:
    //     group: admin
    //     enabled: true
    // --> group = 'admin AND enabled = 'true'
    for (const attributeName in this.attributes) {
      if (
        !this.doesUserHasAttributeWithValue(
          user,
          attributeName,
          String(this.attributes[attributeName])
        )
      )
        return false;
    }
    return true;
  }

  private doesUserHasAttributeWithValue(
    user: AuthUserInfo,
    attributeName: string,
    attributeValue: string
  ): boolean {
    for (const userAttributeName in user.attr) {
      if (
        // attribute name passes the pattern
        getRegexpFromWildcardPattern(attributeName).test(userAttributeName) &&
        // attribute value passes the pattern
        getRegexpFromWildcardPattern(attributeValue).test(
          String(user.attr[userAttributeName])
        )
      )
        return true;
    }
    return false;
  }
}
