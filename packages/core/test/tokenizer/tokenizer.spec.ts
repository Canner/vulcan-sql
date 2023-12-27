import { tokenize } from '../../src';

describe('Tokenizer', () => {
  it('should be work', () => {
    const result = tokenize(`
      enum Color {
        Red
        Blue
        Green
      }
    `);

    expect(result).toEqual([
      {
        reserved: 'enum',
        name: 'Color',
        decorators: [],
        body: ['Red', 'Blue', 'Green'],
      },
    ]);
  });

  it('should be work with decorators', () => {
    const result = tokenize(`
        model user {
          id: INTEGER! @primary
          first_name: STRING!
          last_name: STRING!
          age: INTEGER!
          full_name: STRING
            @expr(CONCAT(first_name, last_name))
        }
    `);

    expect(result).toEqual([
      {
        reserved: 'model',
        name: 'user',
        decorators: [],
        body: [
          {
            key: 'id',
            value: 'INTEGER',
            symbols: ['!'],
            decorators: [
              {
                key: 'primary',
                value: '',
              },
            ],
          },
          {
            key: 'first_name',
            value: 'STRING',
            symbols: ['!'],
            decorators: [],
          },
          {
            key: 'last_name',
            value: 'STRING',
            symbols: ['!'],
            decorators: [],
          },
          {
            key: 'age',
            value: 'INTEGER',
            symbols: ['!'],
            decorators: [],
          },
          {
            key: 'full_name',
            value: 'STRING',
            symbols: [],
            decorators: [
              {
                key: 'expr',
                value: 'CONCAT(first_name, last_name)',
              },
            ],
          },
        ],
      },
    ]);
  });

  it('relation mdl parse test', () => {
    const input = `
      relation PostUser @condition("Post.author_id = User.id") {
        models: [Post, User]
        type: MANY_TO_MANY
      }
    `;

    const result = tokenize(input);

    expect(result).toEqual([
      {
        reserved: 'relation',
        name: 'PostUser',
        decorators: [
          {
            key: 'condition',
            value: 'Post.author_id = User.id',
          },
        ],
        body: [
          {
            key: 'models',
            value: ['Post', 'User'],
            symbols: [],
            decorators: [],
          },
          {
            key: 'type',
            value: 'MANY_TO_MANY',
            symbols: [],
            decorators: [],
          },
        ],
      },
    ]);
  });

  it('should throw error', () => {
    expect(() => {
      tokenize(`
        model user {
          id: INTEGER! @primary;
          first_name: STRING!;
          last_name: STRING!;
          age: INTEGER!;
          full_name: STRING
            @expr(CONCAT(first_name, last_name));
        }
      `);
    }).toThrow();
  });
});
