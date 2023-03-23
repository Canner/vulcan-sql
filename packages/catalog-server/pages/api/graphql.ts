import type { NextApiRequest, NextApiResponse } from 'next';
import { gql, ApolloServer } from 'apollo-server-micro';
import GraphQLJSON from 'graphql-type-json';
import { authHelper, getBearerToken } from '../../utils/authHelper';
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
  }

  type Query {
    endpoint(slug: String): Endpoint
    endpoints: [Endpoint]
    dataset(endpointSlug: String, filter: JSON): Dataset
  }
`;

const types = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  BOOLEAN: 'BOOLEAN',
};

const testingData = [
  {
    slug: 'customers',
    name: 'Taiwan Customer',
    description: `
    line 1
    line 2
    the customer data we got from ERP.
  `,
    apiDocUrl: 'https://petstore.swagger.io/#/pet',
    parameters: [
      {
        name: 'name',
        key: 'name',
        type: types.STRING,
        description: 'test',
        required: false,
      },
      {
        name: 'age',
        key: 'age',
        type: types.NUMBER,
        description: 'age',
        required: false,
      },
    ],
    columns: [
      {
        name: 'name',
        type: types.STRING,
        description: 'name',
      },
      {
        name: 'age',
        type: types.NUMBER,
        description: 'age',
      },
      {
        name: 'address',
        type: types.STRING,
        description: 'address',
      },
      {
        name: 'email',
        type: types.STRING,
        description: 'email',
      },
    ],
    dataset: [
      {
        name: 'test',
        age: 10,
        address: 'testing address',
        email: 'testing@canner.io',
      },
      {
        name: 'test2',
        age: 20,
        address: 'testing address',
        email: 'testing2@canner.io',
      },
    ],
  },
  {
    slug: 'orders',
    name: 'Taiwan Order',
    description: `
    line 1
    line 2
    the order data we got from ERP.
  `,
    apiDocUrl: 'https://petstore.swagger.io/#/store',
    parameters: [
      {
        name: 'orderkey',
        key: 'orderkey',
        type: types.STRING,
        description: 'orderkey',
        required: false,
      },
      {
        name: 'status',
        key: 'status',
        type: types.STRING,
        description: 'status',
        required: true,
      },
      {
        name: 'shipDate',
        key: 'shipDate',
        type: types.DATETIME,
        description: 'shipDate',
        required: true,
      },
    ],
    columns: [
      {
        name: 'orderkey',
        type: types.STRING,
        description: 'orderkey',
      },
      {
        name: 'status',
        type: types.STRING,
        description: 'status',
      },
      {
        name: 'shipDate',
        type: types.DATETIME,
        description: 'shipDate',
      },
    ],
    dataset: [
      {
        orderkey: '1234',
        status: 'SHIPPED',
        shipDate: Date.now(),
      },
      {
        orderkey: '4556',
        status: 'PENDING',
        shipDate: Date.now(),
      },
    ],
  },
];

const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    endpoints: () => {
      return testingData;
    },
    endpoint: (_, args, context) => {
      return testingData.filter((row) => row.slug === args.slug)[0] || null;
    },
    dataset: (_, args, context) => {
      const data = testingData.filter(
        (row) => row.slug === args.endpointSlug
      )[0];
      if (!data) return null;
      return {
        data: data.dataset,
        metadata: {
          currentCount: 100,
          totalCount: 1000,
        },
        apiUrl: 'http://localhost/api',
        csvDownloadUrl: 'http://localhost/csv',
        jsonDownloadUrl: 'http://localhost/json',
      };
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: NextApiRequest }) => {
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
