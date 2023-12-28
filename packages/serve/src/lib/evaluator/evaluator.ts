import {
  getLogger,
  InternalError,
  Profile,
  ProfileAllowConstraints,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { injectable, multiInject, optional } from 'inversify';
import { isArray } from 'lodash';
import { AuthUserInfo } from '../../models/extensions';
import {
  AuthConstraint,
  UserAttributesConstrain,
  UserNameConstrain,
} from './constraints';

// Single allow condition are combined with AND logic
// Only the user who has name admin and has group attribute with value admin can access this profile.
// - name: 'pg-admin'
//  driver: 'pg'
//  connection: xx
//  allow:
//    - name: admin
//      attributes:
//        name: group
//        value: admin
//
// Multiple allow conditions are combined with OR logic.
// admin, someoneelse, and those who have group attribute with value admin can access this profile.
// - name: 'pg-admin'
//   driver: 'pg'
//   connection: xx
//   allow:
//    - name: admin
//    - name: someoneelse
//    - attributes:
//        name: group
//        value: admin

const logger = getLogger({ scopeName: 'SERVE' });

@injectable()
export class Evaluator {
  private profiles = new Map<string, AuthConstraint[][]>();

  constructor(
    @multiInject(CORE_TYPES.Profile) @optional() profiles: Profile[] = []
  ) {
    for (const profile of profiles) {
      if (!profile.allow) {
        logger.warn(
          `Profile ${profile.name} doesn't have allow property, which means nobody can use it`
        );
        continue;
      }
      logger.debug(`profile: ${profile.name}, allow: ${profile.allow}`);
      this.profiles.set(profile.name, this.getConstraints(profile.allow));
    }
  }

  public evaluateProfile(
    user: AuthUserInfo,
    candidates: string[]
  ): string | null {
    for (const candidate of candidates) {
      const orConstraints = this.profiles.get(candidate);
      if (!orConstraints)
        throw new InternalError(
          `Profile candidate ${candidate} doesn't have any rule.`
        );
      const isQualified = this.evaluateOrConstraints(user, orConstraints);
      if (isQualified) return candidate;
    }
    return null;
  }

  private evaluateOrConstraints(
    user: AuthUserInfo,
    orConstraints: AuthConstraint[][]
  ): boolean {
    for (const constraints of orConstraints) {
      if (this.evaluateAndConstraints(user, constraints)) return true;
    }
    return false;
  }

  private evaluateAndConstraints(
    user: AuthUserInfo,
    andConstraints: AuthConstraint[]
  ): boolean {
    for (const constraint of andConstraints) {
      if (!constraint.evaluate(user || { name: '', attr: {} })) return false;
    }
    return true;
  }

  private getConstraints(allow: ProfileAllowConstraints): AuthConstraint[][] {
    const orConstraints: AuthConstraint[][] = [];
    const rules: Record<string, any>[] = [];
    // allow: admin or allow: *
    if (typeof allow === 'string') rules.push({ name: allow });
    // allow:
    //   name: admin
    else if (!isArray(allow)) rules.push(allow);
    else {
      allow.forEach((rule) => {
        // allow:
        //   - *
        if (typeof rule === 'string') rules.push({ name: rule });
        // allow:
        //   - name: admin
        else rules.push(rule);
      });
    }

    for (const rule of rules) {
      const andConstraints: AuthConstraint[] = [];
      if (rule['name'])
        andConstraints.push(new UserNameConstrain(rule['name']));
      if (rule['attributes'])
        andConstraints.push(new UserAttributesConstrain(rule['attributes']));
      orConstraints.push(andConstraints);
    }

    return orConstraints;
  }
}
