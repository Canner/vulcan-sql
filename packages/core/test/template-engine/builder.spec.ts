import { createTestCompiler } from './testCompiler';

it('query builder should be executes when .value() function called', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = createTestCompiler();
  const { compiledData } = compiler.compile(`
{% req user %}
select * from public.users limit 1 where id = '{{ params.userId }}';
{% endreq %}

{% if user.count().value() == 1 %}
select * from public.user where id = '{{ user.id }}';
{% else %}
{% error "User not found" %}
{% endif %}

  `);
  builder.value.onFirstCall().resolves([1]);
  builder.value.onSecondCall().resolves([{ id: 1, name: 'test' }]);
  // Action
  loader.setSource('test', compiledData);
  const finalResult = await compiler.execute('test', {
    params: { userId: 'user-id' },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    `select * from public.users limit 1 where id = 'user-id';`
  );
  expect(builder.count.callCount).toBe(1);
  expect(finalResult).toEqual([{ id: 1, name: 'test' }]);
});
