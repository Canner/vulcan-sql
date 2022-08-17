import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as path from 'path';

it('Should replace with table name of dbt model with type table', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },

      dbt: {
        modelFiles: [path.join(__dirname, 'test-artifact.json')],
      },
    }
  );

  // Act.
  await compileAndLoad(`select * from {% dbt "model.test.1_table" %}`);
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe('select * from "postgres"."public"."1_table"');
});

it('Should replace with table name of dbt model with type view', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },

      dbt: {
        modelFiles: [path.join(__dirname, 'test-artifact.json')],
      },
    }
  );

  // Act.
  await compileAndLoad(`select * from {% dbt "model.test.2_view" %}`);
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe('select * from "postgres"."public"."2_view"');
});

it('Should replace with sub-query of dbt model with type ephemeral', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },

      dbt: {
        modelFiles: [path.join(__dirname, 'test-artifact.json')],
      },
    }
  );

  // Act.
  await compileAndLoad(
    `select sub.* from {% dbt "model.test.3_ephemeral" %} as sub`
  );
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe(`select sub.* from (
select *
from "postgres"."public"."1_table"
where age <= 18) as sub`);
});

it('Should replace with table name of dbt model with type incremental', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },
      dbt: {
        modelFiles: [path.join(__dirname, 'test-artifact.json')],
      },
    }
  );

  // Act.
  await compileAndLoad(`select * from {% dbt "model.test.4_incremental" %}`);
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe('select * from "postgres"."public"."4_incremental"');
});

it('Should merge multiple artifacts', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },
      dbt: {
        modelFiles: [
          path.join(__dirname, 'test-artifact.json'),
          path.join(__dirname, 'test-artifact-2.json'),
        ],
      },
    }
  );

  // Act.
  await compileAndLoad(
    `{% dbt "model.test.4_incremental" %}{% dbt "model.test.5_model_from_artifact_2" %}`
  );
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe(
    '"postgres"."public"."4_incremental""postgres"."public"."1_table"'
  );
});

it('Should throw error when models are unambiguous', async () => {
  // Arrange
  const { compileAndLoad } = await getTestCompiler({
    extensions: { dbt: path.join(__dirname, '..', 'src') },
    dbt: {
      modelFiles: [
        path.join(__dirname, 'test-artifact-2.json'),
        path.join(__dirname, 'test-artifact-2.json'),
      ],
    },
  });

  // Act. Assert
  await expect(compileAndLoad(`Some sql`)).rejects.toThrow(
    `Model name model.test.5_model_from_artifact_2 is unambiguous`
  );
});

it('Should throw error when model name not found', async () => {
  // Arrange
  const { compileAndLoad } = await getTestCompiler({
    extensions: { dbt: path.join(__dirname, '..', 'src') },
    dbt: {
      modelFiles: [path.join(__dirname, 'test-artifact.json')],
    },
  });

  // Act. Assert
  await expect(compileAndLoad(`{% dbt "not.found.model" %}`)).rejects.toThrow(
    `Model not.found.model is not found in modelFiles`
  );
});

it('Should throw error when argument type is not correct', async () => {
  // Arrange
  const { compileAndLoad } = await getTestCompiler({
    extensions: { dbt: path.join(__dirname, '..', 'src') },
    dbt: {
      modelFiles: [path.join(__dirname, 'test-artifact.json')],
    },
  });

  // Act. Assert
  await expect(compileAndLoad(`{% dbt model.test.1_table %}`)).rejects.toThrow(
    `Expect model name as string, but got symbol`
  );
});

it('Should throw error when there are too many arguments', async () => {
  // Arrange
  const { compileAndLoad } = await getTestCompiler({
    extensions: { dbt: path.join(__dirname, '..', 'src') },
    dbt: {
      modelFiles: [path.join(__dirname, 'test-artifact.json')],
    },
  });

  // Act. Assert
  await expect(
    compileAndLoad(`{% dbt "model.test.1_table" extra arg %}`)
  ).rejects.toThrow(`Expect block end %}, but got symbol`);
});

it('Should not throw error even if there is no dbt config', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },
      dbt: {},
    }
  );

  // Act.
  await compileAndLoad(`some query`);
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe('some query');
});

it('Should not throw error even if the artifact file is empty', async () => {
  // Arrange
  const { compileAndLoad, execute, getExecutedQueries } = await getTestCompiler(
    {
      extensions: { dbt: path.join(__dirname, '..', 'src') },
      dbt: {
        modelFiles: [path.join(__dirname, 'empty-artifact.json')],
      },
    }
  );

  // Act.
  await compileAndLoad(`some query`);
  await execute({});

  // Assert
  const queries = await getExecutedQueries();
  expect(queries[0]).toBe('some query');
});
