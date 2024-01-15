import GraphQLJSON from 'graphql-type-json';

export const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    hello: () => 'Hello world!',
  },
};
