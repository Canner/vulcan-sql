import { flattenElements } from '@vulcan-sql/core';

class Test {
  public t = Test;
}

it('flatten function should flatten array', async () => {
  // Arrange
  const modules: any = [
    Test,
    { test: Test },
    [Test, Test],
    { test: { test: Test } },
    [[Test, Test]],
    1,
    true,
    's',
  ];
  // Act
  const extensions = flattenElements(modules);
  // Assert
  expect(extensions.length).toBe(10);
  expect(
    extensions.slice(0, 7).every((e) => new e() instanceof Test)
  ).toBeTruthy();
});

it('flatten function should flatten record', async () => {
  // Arrange
  const modules: any = {
    t: Test,
    t2: [Test, Test],
    t3: { t: Test },
    t4: { t: { t: Test } },
    t5: [{ t: Test }, Test],
    t6: 1,
    t7: { t1: true, t2: 's' },
  };
  // Act
  const extensions = flattenElements(modules);
  // Assert
  expect(extensions.length).toBe(10);
  expect(
    extensions.slice(0, 7).every((e) => new e() instanceof Test)
  ).toBeTruthy();
});
