import faker from '@faker-js/faker';
import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { repositories } from './test-data/repositories';

// support reading the env from .env file if exited when running test case
dotenv.config({ path: path.resolve(__dirname, '.env') });

describe('Test "huggingface_table_question_answering" filter', () => {
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
        repositories
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
    'Should throw error when pass the "query" argument but value is undefined',
    async () => {
      const token = process.env['HF_ACCESS_TOKEN'];
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { huggingface: path.join(__dirname, '..', 'src') },
        huggingface: {
          accessToken: token,
        },
      });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering(query=undefined) }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow(
        'The "query" argument must have value'
      );
    },
    50 * 1000
  );

  it(
    'Should throw error when pass the "query" argument but value is empty string',
    async () => {
      const token = process.env['HF_ACCESS_TOKEN'];
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { huggingface: path.join(__dirname, '..', 'src') },
        huggingface: {
          accessToken: token,
        },
      });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering(query='') }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow(
        'The "query" argument must have value'
      );
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
    'Should throw error when not provide access token',
    async () => {
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { huggingface: path.join(__dirname, '..', 'src') },
        huggingface: {
          accessToken: '',
        },
      });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering("${faker.internet.password()}") }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow('please given access token');
    },
    50 * 1000
  );

  it(
    'Should throw error when not set hugging face options',
    async () => {
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { huggingface: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering("${faker.internet.password()}") }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow('please given access token');
    },
    50 * 1000
  );

  it(
    'Should get correct expected value when provided "neulab/omnitab-large-1024shot-finetuned-wtq-1024shot" model and wait it for model',
    async () => {
      const expected = JSON.stringify({
        // neulab/omnitab-large-1024shot-finetuned-wtq-1024shot will return the result including space in the beginning of the vulcan-sql -> ' vulcan-sql'
        answer: ' vulcan-sql',
      });
      const token = process.env['HF_ACCESS_TOKEN'];
      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } =
        await getTestCompiler({
          extensions: { huggingface: path.join(__dirname, '..', 'src') },
          huggingface: {
            accessToken: token,
          },
        });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering(query="what repository has most stars?", model="neulab/omnitab-large-1024shot-finetuned-wtq-1024shot", wait_for_model=true) }}`;

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

  it.each([
    {
      question: 'what repository has most stars?',
      expected: {
        answer: 'vulcan-sql',
        coordinates: [[0, 0]],
        cells: ['vulcan-sql'],
        aggregator: 'NONE',
      },
    },
    {
      question: 'what repository has lowest stars?',
      expected: {
        answer: 'hello-world',
        coordinates: [[2, 0]],
        cells: ['hello-world'],
        aggregator: 'NONE',
      },
    },
    {
      question: 'How many stars does the vulcan-sql repository have?',
      expected: {
        answer: 'SUM > 1000',
        coordinates: [[0, 1]],
        cells: ['1000'],
        aggregator: 'SUM',
      },
    },
    {
      question: 'How many stars does the accio repository have?',
      expected: {
        answer: 'AVERAGE > 500',
        coordinates: [[1, 1]],
        cells: ['500'],
        aggregator: 'AVERAGE',
      },
    },
    {
      question: 'How many repositories related to data-lake topic?',
      expected: {
        answer: 'COUNT > vulcan-sql, accio',
        coordinates: [
          [0, 0],
          [1, 0],
        ],
        cells: ['vulcan-sql', 'accio'],
        aggregator: 'COUNT',
      },
    },
  ])(
    'Should get correct $expected answer when asking $question',
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
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering(query="${question}", wait_for_model=true) }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();
      // parse the result to object and match the expected value
      const result = JSON.parse(bindings[0].get('$1'));

      expect(queries[0]).toBe('SELECT $1');
      expect(result).toEqual(expected);
    },
    50 * 1000
  );

  it(
    'Should get correct result when pass the "query" argument by dynamic parameter',
    async () => {
      const expected = {
        answer: 'vulcan-sql',
        coordinates: [[0, 0]],
        cells: ['vulcan-sql'],
        aggregator: 'NONE',
      };
      const token = process.env['HF_ACCESS_TOKEN'];
      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } =
        await getTestCompiler({
          extensions: { huggingface: path.join(__dirname, '..', 'src') },
          huggingface: {
            accessToken: token,
          },
        });

      const sql = `{% set data = ${JSON.stringify(
        repositories
      )} %}SELECT {{ data | huggingface_table_question_answering(query=context.params.value) }}`;

      // Act
      await compileAndLoad(sql);
      await execute({ value: 'what repository has most stars?' });

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();
      // parse the result to object and match the expected value
      const result = JSON.parse(bindings[0].get('$1'));

      expect(queries[0]).toBe('SELECT $1');
      expect(result).toEqual(expected);
    },
    50 * 1000
  );
});
