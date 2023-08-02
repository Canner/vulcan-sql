import faker from '@faker-js/faker';
import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { repositories } from './test-data/repositories';

// support reading the env from .env file if exited when running test case
dotenv.config({ path: path.resolve(__dirname, '.env') });
describe('Test "huggingface_text_generation" filter', () => {
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
      )} %}SELECT {{ data | huggingface_text_generation("Not contains query argument!") }}`;

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
      )} %}SELECT {{ data | huggingface_text_generation(query=undefined) }}`;

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
      )} %}SELECT {{ data | huggingface_text_generation(query='') }}`;

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

    const sql = `{% set data = 'not-array-data' %}SELECT {{ data | huggingface_text_generation(query="Does the filter work or not") }}`;

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
      )} %}SELECT {{ data | huggingface_text_generation("${faker.internet.password()}") }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow('please given access token');
    },
    50 * 1000
  );

  it(
    'Should not throw when passing the "query" argument by dynamic parameter through HuggingFace default recommended "gpt2" model',
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
      )} %}SELECT {{ data | huggingface_text_generation(query=context.params.value, wait_for_model=true, use_cache=false) }}`;

      await compileAndLoad(sql);
      // Assert
      await expect(
        execute({ value: 'what repository has most stars?' })
      ).resolves.not.toThrow();
    },
    100 * 1000
  );

  // Skip the test case because the "meta-llama/Llama-2-13b-chat-hf" model need to upgrade your huggingface account to Pro Account by paying $9 per month
  it.skip(
    'Should get correct result when pass the "query" argument by dynamic parameter through "meta-llama/Llama-2-13b-chat-hf" model',
    async () => {
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
      )} %}SELECT {{ data | huggingface_text_generation(query=context.params.value,model="meta-llama/Llama-2-13b-chat-hf", wait_for_model=true, use_cache=false) }}`;

      await compileAndLoad(sql);
      await execute({ value: 'what repository has most stars?' });

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(
        'Answer: Based on the information provided, the repository with the most stars is "vulcan-sql" with 1000 stars.'
      );
    },
    100 * 1000
  );

  // Skip the test case because the "meta-llama/Llama-2-13b-chat-hf" model need to upgrade your huggingface account to Pro Account by paying $9 per month
  it.skip.each([
    {
      question: 'what repository has most stars?',
      expected:
        'Answer: Based on the information provided, the repository with the most stars is "vulcan-sql" with 1000 stars.',
    },
    {
      question: 'what repository has lowest stars?',
      expected:
        'Answer: Based on the information provided, the repository with the lowest stars is "hello-world" with 0 stars.',
    },
    {
      question: 'How many stars does the vulcan-sql repository have?',
      expected:
        'Answer: Based on the information provided, the vulcan-sql repository has 1000 stars.',
    },
    {
      question: 'How many stars does the accio repository have?',
      expected:
        'Answer: Based on the information provided, the accio repository has 500 stars.',
    },
    {
      question: 'How many repositories related to data-lake topic?',
      expected: `Answer: Based on the provided list of repositories, there are 2 repositories related to the data-lake topic:

      1. vulcan-sql
      2. accio
      
      Both of these repositories have the data-lake topic in their description.`,
    },
  ])(
    'Should get "$expected" answer when asking "$question" through "meta-llama/Llama-2-13b-chat-hf" model',
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
      )} %}SELECT {{ data | huggingface_text_generation(query="${question}", model="meta-llama/Llama-2-13b-chat-hf", wait_for_model=true) }}`;

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
});
