import { Model, Decorator } from '../../src/lib/schemas';
import { RawSchema } from '../../src/lib/schemas/utils';

describe('Test Model Schema', () => {
  it('should be created', () => {
    const schema: RawSchema = {
      reserved: 'model',
      name: 'User',
      decorators: [
        {
          key: 'Entity',
          value: '',
        },
      ],
      body: [
        {
          key: 'first_name',
          value: 'string',
          symbols: ['!'],
          decorators: [],
        },
      ],
    };

    const model = new Model(schema);

    expect(model).toBeInstanceOf(Model);
    expect(model.name).toBe('User');
    expect(model.decorators).toBeInstanceOf(Array);
    expect(model.decorators[0]).toBeInstanceOf(Decorator);
    expect(model.body).toEqual([
      {
        key: 'first_name',
        value: 'string',
        symbols: ['!'],
        decorators: [],
      },
    ]);
  });
});
