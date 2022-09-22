import { Evaluator } from '@vulcan-sql/serve/evaluator';

it('Should evaluate user name with wildcard supported', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: [{ name: 'admin' }, { name: 'ivan*' }, { name: 'fre*da' }],
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: 'ivan12345', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: 'freda', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: 'fre12345da', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: '12345ivan', attr: {} }, ['profile1'])
  ).toBe(null);
});

it('Should evaluate user attribute with wildcard supported', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: [
        { attributes: { group: 'admin' } },
        { attributes: { group: 'admin*', enabled: true } },
        { attributes: { 'group*': 'admin' } },
      ],
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: { group: 'admin' } }, [
      'profile1',
    ])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile(
      { name: 'admin', attr: { group: 'admin12345', enabled: true } },
      ['profile1']
    )
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile(
      { name: 'admin', attr: { group: 'admin12345' } },
      ['profile1']
    )
  ).toBe(null);
  expect(
    evaluator.evaluateProfile(
      { name: 'admin', attr: { group: 'qqq', group1: 'qqq', group2: 'admin' } },
      ['profile1']
    )
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile(
      {
        name: 'admin',
        attr: { group: 'qqq', group1: 'qqq', group2: 'admin123' },
      },
      ['profile1']
    )
  ).toBe(null);
});

it('Allow constraints can be a string', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: 'admin',
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: '12345ivan', attr: {} }, ['profile1'])
  ).toBe(null);
});

it('Allow constraints can be a string array', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: ['admin', { name: 'ivan' }],
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: 'ivan', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: '12345ivan', attr: {} }, ['profile1'])
  ).toBe(null);
});

it('Allow constraints can be a object', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: { name: 'ivan' },
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'ivan', attr: {} }, ['profile1'])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: '12345ivan', attr: {} }, ['profile1'])
  ).toBe(null);
});

it('Should throw error with invalid profile', async () => {
  // Arrange
  const evaluator = new Evaluator([]);
  // Act, Assert
  expect(() =>
    evaluator.evaluateProfile({ name: 'ivan', attr: {} }, ['profile1'])
  ).toThrow(`Profile candidate profile1 doesn't have any rule.`);
});

it('Multiple constraints in single rule should be combined with AND logic', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: {
        name: 'admin',
        attributes: {
          enabled: true,
        },
      },
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: { enabled: true } }, [
      'profile1',
    ])
  ).toBe('profile1');
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: { enabled: false } }, [
      'profile1',
    ])
  ).toBe(null);
  expect(
    evaluator.evaluateProfile({ name: 'admin123', attr: { enabled: true } }, [
      'profile1',
    ])
  ).toBe(null);
});

it('Should return first matched profile', async () => {
  // Arrange
  const evaluator = new Evaluator([
    {
      name: 'profile1',
      type: 'mock',
      allow: {
        name: 'admin123',
      },
    },
    {
      name: 'profile2',
      type: 'mock',
      allow: {
        name: 'admin',
      },
    },
    {
      name: 'profile3',
      type: 'mock',
      allow: {
        name: 'admin',
      },
    },
  ]);
  // Act, Assert
  expect(
    evaluator.evaluateProfile({ name: 'admin', attr: {} }, [
      'profile1',
      'profile2',
      'profile3',
    ])
  ).toBe('profile2');
});
