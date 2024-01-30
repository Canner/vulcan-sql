import getConfig from 'next/config';
import { GetServerSideProps } from 'next';
import SimpleLayout from '@vulcan-sql/admin-ui/components/layouts/SimpleLayout';

export default function Explore({ connections }) {
  return <SimpleLayout connections={connections}>Coming Soon</SimpleLayout>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { serverRuntimeConfig } = getConfig();
  const { PG_DATABASE, PG_PORT, PG_USERNAME, PG_PASSWORD } =
    serverRuntimeConfig;

  return {
    props: {
      connections: {
        database: PG_DATABASE,
        port: PG_PORT,
        username: PG_USERNAME,
        password: PG_PASSWORD,
      },
    },
  };
};
