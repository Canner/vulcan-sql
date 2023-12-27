import { arrayToStream } from '@vulcan-sql/api-layer/utils';
import { Readable } from 'stream';
import { createTestCompiler } from '../../testCompiler';

it('Extension should call the .value() function of builder and consume the stream', async () => {
  // Arrange
  const {
    compiler,
    loader,
    builder,
    executeTemplate,
    getCreatedBinding,
    getCreatedQueries,
  } = await createTestCompiler();
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
  await executeTemplate('test');
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expect(queries[1]).toBe(`select * from group where userId = $1;`);
  expect(binding[1].get('$1')).toBe(`user-id`);
});

it('Extension should throw an error if the main builder failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder, executeTemplate } =
    await createTestCompiler();
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
  await expect(executeTemplate('test')).rejects.toThrow('something went wrong');
});

it('Extension should throw an error if one of sub builders failed to execute', async () => {
  // Arrange
  const { compiler, loader, builder, executeTemplate } =
    await createTestCompiler();
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
  await expect(executeTemplate('test')).rejects.toThrow('something went wrong');
});

it('Extension should return the raw value of .value() when input is not a builder', async () => {
  // Arrange
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedBinding,
    getCreatedQueries,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.someProp.value() }}`
  );
  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test', {
    someProp: { value: () => `someRawVal` },
  });
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe(`$1`);
  expect(binding[0].get('$1')).toBe(`someRawVal`);
});

it('Extension should throw an error if the data stream emit an error', async () => {
  // Arrange
  const { compiler, loader, builder, executeTemplate } =
    await createTestCompiler();
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
  await expect(executeTemplate('test')).rejects.toThrow('something went wrong');
});
