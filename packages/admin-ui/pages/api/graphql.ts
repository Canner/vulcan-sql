import microCors from 'micro-cors';
import { NextApiRequest, NextApiResponse, PageConfig } from 'next';
import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '@vulcan-sql/admin-ui/apollo/server';
import resolvers from '@vulcan-sql/admin-ui/apollo/server/resolvers';
import { IContext } from '@vulcan-sql/admin-ui/apollo/server/types';
import {
  ModelColumnRepository,
  ModelRepository,
  ProjectRepository,
  RelationRepository,
} from '@vulcan-sql/admin-ui/apollo/server/repositories';
import { bootstrapKnex } from '../../apollo/server/utils/knex';
import { GraphQLError } from 'graphql';
import { getLogger } from '@vulcan-sql/admin-ui/apollo/server/utils';
import { getConfig } from '@vulcan-sql/admin-ui/apollo/server/config';
import { ProjectService } from '@vulcan-sql/admin-ui/apollo/server/services/projectService';
import { ModelService } from '@vulcan-sql/admin-ui/apollo/server/services/modelService';

const serverConfig = getConfig();
const apolloLogger = getLogger('APOLLO');

const cors = microCors();

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
const knex = bootstrapKnex({
  dbType: serverConfig.dbType,
  pgUrl: serverConfig.pgUrl,
  debug: serverConfig.debug,
  sqliteFile: serverConfig.sqliteFile,
});
const projectRepository = new ProjectRepository(knex);
const modelRepository = new ModelRepository(knex);
const modelColumnRepository = new ModelColumnRepository(knex);
const relationRepository = new RelationRepository(knex);

const projectService = new ProjectService({ projectRepository });
const modelService = new ModelService();

const apolloServer: ApolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error: GraphQLError) => {
    apolloLogger.error(error.extensions);
    return error;
  },
  introspection: process.env.NODE_ENV !== 'production',
  context: (): IContext => ({
    config: serverConfig,

    // services
    projectService,
    modelService,

    // repository
    projectRepository,
    modelRepository,
    modelColumnRepository,
    relationRepository,
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
