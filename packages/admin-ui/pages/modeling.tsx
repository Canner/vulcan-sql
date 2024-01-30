import dynamic from 'next/dynamic';
import getConfig from 'next/config';
import { forwardRef, useRef } from 'react';
import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';
import { adapter, MDLJson } from '@vulcan-sql/admin-ui/utils/data';
import styled from 'styled-components';
import { readFile } from 'fs/promises';
import { GetServerSideProps } from 'next';
import InfoModal, {
  useInfoModal,
} from '@vulcan-sql/admin-ui/components/modals/infoModal';

const Diagram = dynamic(() => import('@vulcan-sql/ui/src/lib/diagram'), {
  ssr: false,
});
// https://github.com/vercel/next.js/issues/4957#issuecomment-413841689
const ForwardDiagram = forwardRef(function ForwardDiagram(props: any, ref) {
  return <Diagram {...props} forwardRef={ref} />;
});

const DiagramWrapper = styled.div`
  position: relative;
  padding-right: 16px;
  height: calc(100% - 48px);
`;

export function Modeling({ mdlJson, connections }) {
  const diagramRef = useRef(null);
  const adaptedData = adapter(mdlJson as MDLJson);

  const { openInfoModal, closeInfoModal, infoModalProps } = useInfoModal();

  const onSelect = (selectKeys) => {
    if (diagramRef.current) {
      const { getNodes, fitBounds } = diagramRef.current;
      const node = getNodes().find((node) => node.id === selectKeys[0]);
      const position = {
        ...node.position,
        width: node.width,
        height: node.height,
      };
      fitBounds(position);
    }
  };

  const onInfoIconClick = (data) => {
    openInfoModal(data);
  };

  return (
    <SiderLayout
      connections={connections}
      sidebar={{
        data: adaptedData,
        onSelect,
      }}
    >
      <DiagramWrapper>
        <ForwardDiagram
          ref={diagramRef}
          data={adaptedData}
          onInfoIconClick={onInfoIconClick}
        />
      </DiagramWrapper>
      <InfoModal
        visible={infoModalProps.visible}
        title={infoModalProps.title}
        data={infoModalProps.data}
        onOk={closeInfoModal}
        onCancel={closeInfoModal}
      />
    </SiderLayout>
  );
}

export default Modeling;

export const getServerSideProps: GetServerSideProps = async () => {
  const { serverRuntimeConfig } = getConfig();
  const { JSON_PATH, PG_DATABASE, PG_PORT, PG_USERNAME, PG_PASSWORD } =
    serverRuntimeConfig;

  let mdlJson = {};
  try {
    mdlJson = JSON.parse(await readFile(JSON_PATH, 'utf-8'));
  } catch (e) {
    throw new Error('Could not read JSON file');
  }

  return {
    props: {
      mdlJson,
      connections: {
        database: PG_DATABASE,
        port: PG_PORT,
        username: PG_USERNAME,
        password: PG_PASSWORD,
      },
    },
  };
};
