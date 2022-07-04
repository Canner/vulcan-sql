// stub uuid v4 in test.

import faker from '@faker-js/faker';
// create fake uuid value and make it fixed.
const uuid = faker.datatype.uuid();
export const v4 = () => uuid;
