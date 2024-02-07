import styled from 'styled-components';
import SidebarTree from './SidebarTree';
import ModelTree from './modeling/ModelTree';
import MetricTree from './modeling/MetricTree';
import ViewTree from './modeling/ViewTree';
import { AdaptedData } from '@vulcan-sql/admin-ui/utils/data';

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
`;

interface Props {
  data: AdaptedData | null;
  onSelect?: (selectKeys) => void;
}

export default function Modeling(props: Props) {
  // TODO: get sidebar data
  const { data, onSelect } = props;
  const { models = [], metrics = [], views = [] } = data || {};

  return (
    <>
      <ModelTree models={models} onSelect={onSelect} selectedKeys={[]} />
      <MetricTree metrics={metrics} onSelect={onSelect} selectedKeys={[]} />
      <ViewTree views={views} onSelect={onSelect} selectedKeys={[]} />
    </>
  );
}
