import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import getConfig from 'next/config';
import { forwardRef, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { MORE_ACTION, NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';
import { adapter, Manifest } from '@vulcan-sql/admin-ui/utils/data';
import MetadataDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetadataDrawer';
import ModelDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/ModelDrawer';
import MetricDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetricDrawer';
import useDrawerAction from '@vulcan-sql/admin-ui/hooks/useDrawerAction';
import { useManifestQuery } from '@vulcan-sql/admin-ui/apollo/client/graphql/manifest.generated';

const Diagram = dynamic(() => import('@vulcan-sql/ui/src/lib/diagram'), {
  ssr: false,
});
// https://github.com/vercel/next.js/issues/4957#issuecomment-413841689
const ForwardDiagram = forwardRef(function ForwardDiagram(props: any, ref) {
  return <Diagram {...props} forwardRef={ref} />;
});

const DiagramWrapper = styled.div`
  position: relative;
  height: 100%;
`;

export function Modeling({ connections }) {
  const diagramRef = useRef(null);

  const { data } = useManifestQuery();

  const adaptedManifest = useMemo(() => {
    if (!data) return null;
    return adapter(data?.manifest as Manifest);
  }, [data]);

  const metadataDrawer = useDrawerAction();
  const modelDrawer = useDrawerAction();
  const metricDrawer = useDrawerAction();

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

  const onNodeClick = (payload) => {
    metadataDrawer.openDrawer(payload.data);
  };

  const onMoreClick = (payload) => {
    const { type, data } = payload;
    const action = {
      [MORE_ACTION.EDIT]: () => {
        const { nodeType } = data;
        if (nodeType === NODE_TYPE.MODEL) modelDrawer.openDrawer(data);
        if (nodeType === NODE_TYPE.METRIC) metricDrawer.openDrawer(data);
      },
      [MORE_ACTION.DELETE]: () => {
        // TODO: call delete API
        console.log(data);
      },
    };
    action[type] && action[type]();
  };

  return (
    <SiderLayout
      connections={connections}
      loading={adaptedManifest === null}
      sidebar={{
        data: adaptedManifest,
        onSelect,
      }}
    >
      <DiagramWrapper>
        <ForwardDiagram
          ref={diagramRef}
          data={adaptedManifest}
          onMoreClick={onMoreClick}
          onNodeClick={onNodeClick}
        />
      </DiagramWrapper>
      <MetadataDrawer
        {...metadataDrawer.state}
        onClose={metadataDrawer.closeDrawer}
      />
      <ModelDrawer
        {...modelDrawer.state}
        onClose={modelDrawer.closeDrawer}
        onSubmit={async (values) => {
          console.log(values);
        }}
      />
      <MetricDrawer
        {...metricDrawer.state}
        onClose={metricDrawer.closeDrawer}
        onSubmit={async (values) => {
          console.log(values);
        }}
      />
    </SiderLayout>
  );
}

export default Modeling;

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
