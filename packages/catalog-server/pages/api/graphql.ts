import type { NextApiRequest, NextApiResponse } from 'next';
import { gql, ApolloServer } from 'apollo-server-micro';
import GraphQLJSON from 'graphql-type-json';
import {
  authHelper,
  getBearerToken,
  UserProfile,
} from '@vulcan-sql/catalog-server/utils/authHelper';
import adapter from '@vulcan-sql/catalog-server/utils/vulcanSQLAdapter';
import { Dataset, Endpoint } from '@vulcan-sql/catalog-server/utils/dataModel';
import * as microCors from 'micro-cors';
const cors = microCors();

const typeDefs = gql`
  scalar JSON

  enum ColumnType {
    STRING
    NUMBER
    DATE
    DATETIME
    BOOLEAN
  }

  type Parameter {
    name: String
    key: String
    type: ColumnType
    description: String
    required: Boolean
  }

  type Column {
    name: String
    type: ColumnType
    description: String
  }

  type Endpoint {
    slug: String
    name: String
    description: String
    apiDocUrl: String
    parameters: [Parameter]
    columns: [Column]
  }

  type DatasetMetadata {
    currentCount: Int
    totalCount: Int
  }

  type Dataset {
    data: JSON
    metadata: DatasetMetadata
    apiUrl: String
    csvDownloadUrl: String
    jsonDownloadUrl: String
    shareJsonUrl: String
  }

  type Query {
    endpoint(slug: String): Endpoint
    endpoints: [Endpoint]
    dataset(endpointSlug: String, filter: JSON): Dataset
  }
`;

const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    endpoints: async (_, args, ctx): Promise<Endpoint[]> => {
      const schemas = await adapter.getSchemas(ctx);
      return schemas.map((schema) => new Endpoint(schema));
    },
    endpoint: async (_, args, ctx) => {
      const schema = await adapter.getSchema(ctx, args.slug);
      return new Endpoint(schema);
    },
    dataset: async (_, args, ctx) => {
      const { schema, data } = await adapter.getPreviewData(ctx, {
        slug: args.endpointSlug,
        filter: args.filter,
      });
      return new Dataset(schema, data);
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({
    req,
  }: {
    req: NextApiRequest;
  }): Promise<{ profile: UserProfile; apiToken: string }> => {
    const accessToken = getBearerToken(req.headers);
    const { profile, apiToken } = await authHelper.auth(accessToken);
    return {
      profile,
      apiToken,
    };
  },
});

const startServer = apolloServer.start();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
};

export default cors((req: NextApiRequest, res: NextApiResponse) =>
  req.method === 'OPTIONS' ? res.status(200).end() : handler(req, res)
);

export const config = {
  api: {
    bodyParser: false,
  },
};
