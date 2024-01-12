import { tokenize } from '../../../src';
import { RawSchema } from '../../../src/lib/mdl-parser/schemas/utils';
import { Semantic } from '../../../src/lib/mdl-parser/semanticizer';

describe('Integration Test: Tokenize and Schema Integration', () => {
  it('should tokenize the input data and integrate with the schema', () => {
    const input = `
      config {
        engine: "bigquery"
        project: "test"
        schema: "test"
        credential_file: "secret.json"
        access_key: "123"
        secret_key: "123"
      }

      enum OrderStatus {
        PENDING: 1
        PROCESSING: 2
        COMPLETED: 3
      }

      relation PostUser @condition("Post.author_id = User.id") @desc("Post and User relation") {
        models: [Post, User]
        type: MANY_TO_MANY
      }

      model User @sql("SELECT * FROM Employee") @desc("User model") @cached('5d') {
        id: integer! @primaryKey @desc("User id")
        first_name: string! @desc("User first name")
        last_name: string! @desc("User last name")
        age: integer!
        full_name: string
          @expr(CONCAT(first_name, ' ', last_name))
          @desc("User full name")
        posts: Post[] @relation(PostUser)
      }

      model Post @sql("SELECT * FROM Post") {
        id: integer! @primaryKey
        title: string!
        body: string!
        author: User[] @relation(PostUser)
      }

      Metric ActiveUserCount @model(User) @desc("Active user count") {
        count: Int @measure(count(User))
        status: STATUS @dim(User.last_order.status)
        country: String @dim(User.country)
        date: Date @time_grain(User.last_time_online, [DAY, MONTH])
      }

      Metric PostCount @model(Post) @cached('1y') @cached('1y') {
        count: Int @measure(count(Post))
        date: Date @time_grain(Post.created_at, [DAY, MONTH])
      }

      View {
        activeUserIn2Months: 'select
        * from users where now() - last_time_online in 2 month'
      }
    `;

    const schemas = tokenize(input) as RawSchema[];
    const semantic = new Semantic(schemas);
    const result = semantic.toJSON();

    expect(result.models[0].refSql).toEqual('SELECT * FROM Employee');
    expect(result.models[1].refSql).toEqual('SELECT * FROM Post');

    expect(result.metrics[0].timeGrain[0].dateParts).toEqual(['DAY', 'MONTH']);
    expect(result.metrics[0].cached).toBeUndefined();

    expect(result.metrics[1].timeGrain[0].dateParts).toEqual(['DAY', 'MONTH']);
    expect(result.metrics[1].cached).toEqual(true);
    expect(result.metrics[1].refreshTime).toEqual('1y');

    expect(semantic.config?.get('access_key')).toEqual('123');
    expect(semantic.config?.get('secret_key')).toEqual('123');
    expect(semantic.config?.get('credential_file')).toEqual('secret.json');

    expect(result.relationships[0].description).toEqual(
      'Post and User relation'
    );
    expect(result.models[0].description).toEqual('User model');
    expect(result.models[0].columns[0].description).toEqual('User id');
    expect(result.models[0].columns[1].description).toEqual('User first name');
    expect(result.models[0].columns[2].description).toEqual('User last name');
    expect(result.models[0].columns[3].description).toBeUndefined();
    expect(result.models[0].columns[4].description).toEqual('User full name');

    expect(result.metrics[0].description).toEqual('Active user count');

    expect(result.catalog).toEqual('test');
    expect(result.schema).toEqual('test');

    expect(result.models[0].cached).toEqual(true);
    expect(result.models[0].refreshTime).toEqual('5d');

    expect(result.models[1].cached).toBeUndefined();
    expect(result.models[1].refreshTime).toBeUndefined();

    expect(result.enumDefinitions[0].name).toEqual('OrderStatus');
    expect(result.enumDefinitions[0].values[0].name).toEqual('PENDING');
    expect(result.enumDefinitions[0].values[0].value).toEqual('1');

    expect(result.views[0].name).toEqual('activeUserIn2Months');
    expect(result.views[0].statement).toEqual(
      'select * from users where now() - last_time_online in 2 month'
    );
  });
});
