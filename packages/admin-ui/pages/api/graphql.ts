import microCors from 'micro-cors';
import { NextApiRequest, NextApiResponse, PageConfig } from 'next';
import { ApolloServer } from 'apollo-server-micro';
import { typeDefs, resolvers } from '@vulcan-sql/admin-ui/apollo/server';
import { IContext } from '@vulcan-sql/admin-ui/apollo/server/types';

const cors = microCors();

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const apolloServer: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  context: (): IContext => ({
    // Place your context like repository, service layer here
    // modelRepository: new ModelRepository(),
  }),
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
