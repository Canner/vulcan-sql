import getConfig from 'next/config';
import { GetServerSideProps } from 'next';
import { Button } from 'antd';
import { ExploreIcon } from '@vulcan-sql/admin-ui/utils/icons';
import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';
import SelectDataToExploreModal from '@vulcan-sql/admin-ui/components/pages/explore/SelectDataToExploreModal';
import Background from '@vulcan-sql/admin-ui/components/Background';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';

export default function Explore({ connections }) {
  const selectDataToExploreModal = useModalAction();

  return (
    <SiderLayout sidebar={{} as any} connections={connections}>
      <Background />

      <div
        className="d-flex align-center justify-center"
        style={{ height: '100%' }}
      >
        <Button
          icon={<ExploreIcon className="mr-2" />}
          onClick={() => selectDataToExploreModal.openModal()}
        >
          Select data to explore
        </Button>
      </div>

      <SelectDataToExploreModal
        {...selectDataToExploreModal.state}
        onClose={selectDataToExploreModal.closeModal}
      />
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
