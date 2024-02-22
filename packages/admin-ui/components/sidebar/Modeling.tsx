import styled from 'styled-components';
import SidebarTree from './SidebarTree';
import ModelTree from './modeling/ModelTree';
import MetricTree from './modeling/MetricTree';
import ViewTree from './modeling/ViewTree';
import { AdaptedData } from '@vulcan-sql/admin-ui/utils/data';
import useDrawerAction from '@vulcan-sql/admin-ui/hooks/useDrawerAction';
import ModelDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/ModelDrawer';
import MetricDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetricDrawer';

export const StyledSidebarTree = styled(SidebarTree)`
  .ant-tree-title {
    flex-grow: 1;
    display: inline-flex;
    align-items: center;
    span:first-child,
    .adm-treeTitle__title {
      flex-grow: 1;
    }
  }

  .adm-treeNode {
    .ant-tree-title {
      display: inline-flex;
      flex-wrap: nowrap;
      min-width: 1px;
      flex-grow: 0;
    }
  }
`;

interface Props {
  data: AdaptedData | null;
  onSelect?: (selectKeys) => void;
}

export default function Modeling(props: Props) {
  // TODO: get sidebar data
  const { data, onSelect } = props;
  const { models = [], metrics = [], views = [] } = data || {};

  const modelDrawer = useDrawerAction();
  const metricDrawer = useDrawerAction();

  return (
    <>
      <ModelTree
        models={models}
        onSelect={onSelect}
        selectedKeys={[]}
        onOpenModelDrawer={modelDrawer.openDrawer}
      />
      <MetricTree
        metrics={metrics}
        onSelect={onSelect}
        selectedKeys={[]}
        onOpenMetricDrawer={metricDrawer.openDrawer}
      />
      <ViewTree views={views} onSelect={onSelect} selectedKeys={[]} />
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
    </>
  );
}
