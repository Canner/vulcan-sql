import { arrayToStream } from '@vulcan-sql/api-layer/utils';
import { createTestCompiler } from '../../testCompiler';

const queryTest = async (
  template: string,
  expectedQueries: string[],
  expectedBindings: any[][],
  customParameters?: Record<string, any>
) => {
  // Arrange
  const {
    compiler,
    loader,
    builder,
    executeTemplate,
    getCreatedBinding,
    getCreatedProfiles,
    getCreatedQueries,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(template);
  builder.value.onFirstCall().resolves({
    getColumns: () => [],
    getData: () => arrayToStream([{ id: 1, name: 'freda' }]),
  });
  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test', customParameters || { id: 1, name: 'freda' });
  const profiles = await getCreatedProfiles();
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expectedQueries.forEach((_, index) =>
    expect(profiles[index]).toBe('mocked-profile')
  );
  expectedQueries.forEach((query, index) => expect(queries[index]).toBe(query));
  expectedBindings.forEach((expectedBinding, index) => {
    expect(Array.from(binding[index].values())).toEqual(expectedBinding);
  });
};

it('Should parameterize input parameters', async () => {
  await queryTest(
    `select * from users where id = {{ context.params.id }} or name = {{ context.params.name }}`,
    [`select * from users where id = $1 or name = $2`],
    [[1, 'freda']]
  );
});

it('Should parameterize all lookup or function call nodes', async () => {
  await queryTest(
    `{% set someVar = context.params.simple.id %}
{{ someVar }}
{{ someVar + 1 }}
{{ context.params.someFunction() }}
{{ context.params.someFunction() + '!' }}
{{ context.params.complexObj.func()().func2().a.b }}`,
    [`$1\n$11\n$2\n$2!\n$3`],
    [[1, 'functionResult', 'complexResult']],
    {
      simple: { id: 1, name: 'freda' },
      someFunction: () => 'functionResult',
      complexObj: {
        func: () => () => ({
          func2: () => ({
            a: { b: 'complexResult' },
          }),
        }),
      },
    }
  );
});

it('Should reuse the parameter with same values', async () => {
  await queryTest(
    `{{ context.params.id }}{{ context.params.name }}{{ context.params.id }}`,
    [`$1$2$1`],
    [[1, 'freda']]
  );
});

it('Should reset the index with new request', async () => {
  await queryTest(
    `{% req user %}
select * from users where name = {{ context.params.name }}
{% endreq %}
select * from groups where userId = {{ user.value()[0].id }}`,
    [
      `select * from users where name = $1`,
      `select * from groups where userId = $1`,
    ],
    [['freda'], [1]]
  );
});

it('Should use raw value to handle application logic', async () => {
  await queryTest(
    `{% if context.params.id == 1 %}This should be rendered - {{ context.params.id }}{% endif %}
{% set someVar = context.params.id + 1 %}
{% if someVar == 2 %}This should be rendered - {{ someVar }}{% endif %}
{% set someArray = [5,6,7] %}
{% for val in someArray %}
{{ val }}
{% endfor %}
  `,
    [
      `This should be rendered - $1
This should be rendered - $2
$3
$4
$5`,
    ],
    [[1, 2, 5, 6, 7]]
  );
});

it('The binding values should be in order which they are used', async () => {
  await queryTest(
    `{{ context.params.name }}{{ context.params.id }}`,
    [`$1$2`],
    [['freda', 1]]
  );
});

it('Should render raw value when using raw filter', async () => {
  await queryTest(
    `{{ context.params.id | raw }}{{ context.params.name | upper | raw }}`,
    [`1FREDA`],
    []
  );
});

it('Raw value should be wrapped again when accessing its children', async () => {
  await queryTest(
    `{{ (context.params.data | raw).name }}`,
    [`$1`],
    [['freda']],
    { data: { id: 1, name: 'freda' } }
  );
});

it('Raw value should be wrapped again when raw filter is chaining again', async () => {
  await queryTest(
    `{{ context.params.name | raw | upper }}`,
    [`$1`],
    [['FREDA']]
  );
});

it('Raw value should be wrapped again when it is assigned to variables and is rendered', async () => {
  await queryTest(
    `{% set someVar = (context.params.name | upper | raw) %}
{% if someVar == "FREDA" %}This should be rendered{% endif %}
{{ someVar }}`,
    [`This should be rendered\n$1`],
    [['FREDA']]
  );
});

it('Nothing should be added into binding if the value is undefined', async () => {
  await queryTest(
    `{{ context.params.aaaa }}{{ context.params.name }}`,
    [`$1`],
    [['freda']]
  );
});

it('Nothing should be added into binding if the value had been voided', async () => {
  await queryTest(
    `{{ context.params.name | void }}{{ context.params.name }}`,
    [`$1`],
    [['freda']]
  );
});
