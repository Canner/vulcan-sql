import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { Path } from '@vulcan-sql/admin-ui/utils/enum';
import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';
import Background from '@vulcan-sql/admin-ui/components/Background';

export default function Exploration({ connections }) {
  const router = useRouter();

  // TODO: call API to get real exploration list data
  const data = [
    {
      id: 'id-1',
      name: 'global customer',
    },
    {
      id: 'id-2',
      name: 'customer order amount exceeding 5000 ',
    },
  ];

  const onSelect = (selectKeys: string[]) => {
    router.push(`${Path.Exploration}/${selectKeys[0]}`);
  };

  return (
    <SiderLayout
      connections={connections}
      loading={false}
      sidebar={{ data, onSelect }}
    >
      <Background />
      Exploration ID: {router.query.id}
    </SiderLayout>
  );
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
