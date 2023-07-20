import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as dotenv from 'dotenv';
import * as path from 'path';

// support reading the env from .env file if exited when running test case
dotenv.config({ path: path.resolve(__dirname, '.env') });

const data = [
  {
    repository: 'vulcan-sql',
    stars: 1000,
    topic: ['analytics', 'data-lake', 'data-warehouse', 'api-builder'],
    description:
      'Create and share Data APIs fast! Data API framework for DuckDB, ClickHouse, Snowflake, BigQuery, PostgreSQL',
  },
  {
    repository: 'accio',
    stars: 500,
    topic: [
      'data-analytics',
      'data-lake',
      'data-warehouse',
      'bussiness-intelligence',
    ],
    description: 'Query Your Data Warehouse Like Exploring One Big View.',
  },
  {
    repository: 'hell-word',
    stars: 0,
    topic: [],
    description: 'Sample repository for testing',
  },
];

it.each([
  { question: 'what repository has most stars?', expected: 'vulcan-sql' },
  { question: 'what repository has lowest stars?', expected: 'hell-word' },
  {
    question: 'How many stars does the vulcan-sql repository have?',
    expected: '1000',
  },
  {
    question: 'How many stars does the accio repository have?',
    expected: '500',
  },
  {
    question: 'How many repositories related to data-lake topic?',
    expected: 'vulcan-sql, accio',
  },
])(
  'Should get correct expected $answer when asking $question',
  async ({ question, expected }) => {
    // Arrange

    const token = process.env['HF_ACCESS_TOKEN'];
    const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } =
      await getTestCompiler({
        extensions: { huggingface: path.join(__dirname, '..', 'src') },
        huggingface: {
          accessToken: token,
        },
      });

    const sql = `{% set data = ${JSON.stringify(
      data
    )} %}SELECT {{ data | huggingface_table_question_answering(query="${question}") }}`;

    // Act
    await compileAndLoad(sql);
    await execute({});

    // Assert
    const queries = await getExecutedQueries();
    const bindings = await getCreatedBinding();

    expect(queries[0]).toBe('SELECT $1');
    expect(bindings[0].get('$1')).toEqual(expected);
  },
  50 * 1000
);

it(
  'Should throw error when not pass the "query" argument',
  async () => {
    const token = process.env['HF_ACCESS_TOKEN'];
    const { compileAndLoad, execute } = await getTestCompiler({
      extensions: { huggingface: path.join(__dirname, '..', 'src') },
      huggingface: {
        accessToken: token,
      },
    });

    const sql = `{% set data = ${JSON.stringify(
      data
    )} %}SELECT {{ data | huggingface_table_question_answering("Not contains query argument!") }}`;

    // Act
    await compileAndLoad(sql);

    // Assert
    await expect(execute({})).rejects.toThrow(
      'Must provide "query" keyword argument'
    );
  },
  50 * 1000
);

it(
  'Should throw error when pass the "query" argument by dynamic parameter',
  async () => {
    const token = process.env['HF_ACCESS_TOKEN'];
    const { compileAndLoad, execute } = await getTestCompiler({
      extensions: { huggingface: path.join(__dirname, '..', 'src') },
      huggingface: {
        accessToken: token,
      },
    });

    const sql = `{% set data = ${JSON.stringify(
      data
    )} %}SELECT {{ data | huggingface_table_question_answering(query=context.param.value) }}`;

    // Act
    await compileAndLoad(sql);

    // Assert
    await expect(
      execute({ value: 'what repository has most stars?' })
    ).rejects.toThrow('The "query" argument must have value');
  },
  50 * 1000
);

it('Should throw error when input value not be array of object', async () => {
  const token = process.env['HF_ACCESS_TOKEN'];
  const { compileAndLoad, execute } = await getTestCompiler({
    extensions: { huggingface: path.join(__dirname, '..', 'src') },
    huggingface: {
      accessToken: token,
    },
  });

  const sql = `{% set data = 'not-array-data' %}SELECT {{ data | huggingface_table_question_answering(query="Does the filter work or not") }}`;

  // Act
  await compileAndLoad(sql);

  // Assert
  await expect(execute({})).rejects.toThrow(
    'Input value must be an array of object'
  );
});

it(
  'Should throw error when provided model cause the Hugging Face tableQuestionAnswering task failed',
  async () => {
    const token = process.env['HF_ACCESS_TOKEN'];
    const { compileAndLoad, execute } = await getTestCompiler({
      extensions: { huggingface: path.join(__dirname, '..', 'src') },
      huggingface: {
        accessToken: token,
      },
    });

    const sql = `{% set data = ${JSON.stringify(
      data
    )} %}SELECT {{ data | huggingface_table_question_answering(query="what repository has most stars?", model="neulab/omnitab-large-1024shot-finetuned-wtq-1024shot") }}`;

    // Act
    await compileAndLoad(sql);

    // Assert
    await expect(execute({})).rejects.toThrow(
      "Error when sending data to Hugging Face for executing TableQuestionAnswering tasks, details: Invalid inference output: Expected {aggregator: string, answer: string, cells: string[], coordinates: number[][]}. Use the 'request' method with the same parameters to do a custom call with no type checking."
    );
  },
  50 * 1000
);
