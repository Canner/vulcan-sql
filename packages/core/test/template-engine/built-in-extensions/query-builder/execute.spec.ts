import { arrayToStream } from '@vulcan-sql/core';
import { CURRENT_PROFILE_NAME } from '@vulcan-sql/core/template-engine/built-in-extensions/query-builder/constants';
import { Readable } from 'stream';
import { createTestCompiler } from '../../testCompiler';

it('Extension should call the .value() function of builder and consume the stream', async () => {
  // Arrange
  const { compiler, loader, executor, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %}
select * from users;
{% endreq %}

select * from group where userId = {{ user.count(3).value()[0].id }};
`
  );
  builder.count.returns(builder);
  builder.value.onFirstCall().resolves({
    getColumns: () => [],
    getData: () => arrayToStream([{ id: 'user-id' }]),
  });
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('mocked-profile');
  expect(executor.createBuilder.secondCall.args[1]).toBe(
    `select * from group where userId = $1;`
  );
  expect(executor.createBuilder.secondCall.args[2].get('$1')).toBe(`user-id`);
});

it('Extension should throw an error if the main builder failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user main %}
select * from users;
{% endreq %}
`
  );
  builder.value.onFirstCall().rejects(new Error('something went wrong'));
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(
    compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' })
  ).rejects.toThrow('something went wrong');
});

it('Extension should throw an error if one of sub builders failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %}
select * from users;
{% endreq %}
select * from group where userId = '{{ user.value()[0].id }}';
`
  );
  builder.value.onFirstCall().rejects(new Error('something went wrong'));
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(
    compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' })
  ).rejects.toThrow('something went wrong');
});

it('Extension should return the raw value of .value() when input is not a builder', async () => {
  // Arrange
  const { compiler, loader, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.someProp.value() }}`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { someProp: { value: () => `someRawVal` } } },
    [CURRENT_PROFILE_NAME]: 'mocked-profile',
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('mocked-profile');
  expect(executor.createBuilder.firstCall.args[1]).toBe(`$1`);
  expect(executor.createBuilder.firstCall.args[2].get('$1')).toBe(`someRawVal`);
});

it('Extension should throw an error if the data stream emit an error', async () => {
  // Arrange
  const { compiler, loader, builder } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %} select * from users; {% endreq %}
select * from group where userId = '{{ user.value()[0].id }}';
`
  );
  const stream = new Readable({
    objectMode: true,
    read() {
      this.emit('error', new Error('something went wrong'));
    },
  });
  builder.value.onFirstCall().resolves({
    getColumns: () => [],
    getData: () => stream,
  });

  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(
    compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' })
  ).rejects.toThrow('something went wrong');
});
