import dynamic from 'next/dynamic';
import getConfig from 'next/config';
import { forwardRef, useRef } from 'react';
import { Layout, Button } from 'antd';
import { adapter } from '@vulcan-sql/admin-ui/utils/data/adapter';
import { MDLJson } from '@vulcan-sql/admin-ui/utils/data/model';
import ContentHeader from '@vulcan-sql/admin-ui/components/ContentHeader';
import SharePopover from '@vulcan-sql/admin-ui/components/SharePopover';
import styled from 'styled-components';
import { readFile } from 'fs/promises';
import { GetServerSideProps } from 'next';
import InfoModal, { useInfoModal } from '@vulcan-sql/admin-ui/components/infoModal';

const { Sider, Content } = Layout;

const Sidebar = dynamic(() => import('@vulcan-sql/admin-ui/components/sidebar'), {
  ssr: false,
});
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

  const infoSources = [
    { title: 'Database', type: 'text', value: connections.database },
    { title: 'Port', type: 'text', value: connections.port },
    { title: 'Username', type: 'text', value: connections.username },
    { title: 'Password', type: 'password', value: connections.password },
  ];
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
    <Layout className="adm-main">
      <Sider width={272}>
        <Sidebar data={adaptedData} onSelect={onSelect} />
      </Sider>
      <Content>
        <ContentHeader>
          <SharePopover sources={infoSources}>
            <Button type="link">Share</Button>
          </SharePopover>
        </ContentHeader>
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
      </Content>
    </Layout>
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
