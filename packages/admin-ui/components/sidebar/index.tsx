import styled from 'styled-components';
import SidebarTree from './SidebarTree';
import { getMetricTreeData, getModelTreeData } from './utils';
import { AdaptedData } from '@admin-ui/utils/data/adapter';

const Layout = styled.div`
  position: relative;
  min-height: 100%;
  background-color: var(--gray-3);
  color: var(--gray-8);
  padding-bottom: 24px;
  overflow-x: hidden;

  .ant-dropdown-menu-item {
    min-height: 39px;
    color: var(--gray-8);

    &:hover {
      background-color: var(--gray-4);
    }

    &-disabled {
      color: var(--gray-5);
      &:hover {
        color: var(--gray-5);
        background-color: transparent;
      }
    }

    &-selected {
      position: relative;
      color: var(--gray-8);
      background-color: var(--gray-4);
      font-weight: 700;

      &:before,
      &:after {
        content: '';
        position: absolute;
        right: 16px;
        height: 2px;
        background-color: var(--gray-7);
        border-radius: 2px;
      }
      &:after {
        transform: rotate(45deg) translate(-2px, 6px);
        width: 8px;
      }

      &:before {
        transform: rotate(-50deg) translate(4px, 4px);
        width: 16px;
      }
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;

  img {
    margin-right: 8px;
  }
`;

interface Props {
  data: AdaptedData;
  onSelect?: (selectKeys) => void;
}

export default function Sidebar(props: Props) {
  const { data, onSelect } = props;

  return (
    <Layout>
      <Header>
        <span>Data Modeling</span>
      </Header>

      <SidebarTree
        treeData={getModelTreeData(data)}
        onSelect={onSelect}
        selectedKeys={[]}
      />

      <SidebarTree
        treeData={getMetricTreeData(data)}
        onSelect={onSelect}
        selectedKeys={[]}
      />
    </Layout>
  );
}
