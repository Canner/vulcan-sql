import { Layout } from 'antd';
import styled from 'styled-components';
import SimpleLayout from '@vulcan-sql/admin-ui/components/layouts/SimpleLayout';
import Sidebar from '@vulcan-sql/admin-ui/components/sidebar';

const { Sider } = Layout;

const StyledContentLayout = styled(Layout)`
  position: relative;
`;

const StyledSider = styled(Sider)`
  height: calc(100vh - 48px);
  overflow: auto;
`;

type Props = React.ComponentProps<typeof SimpleLayout> & {
  sidebar: React.ComponentProps<typeof Sidebar>;
};

export default function SiderLayout(props: Props) {
  const { connections, sidebar, loading } = props;

  return (
    <SimpleLayout connections={connections} loading={loading}>
      <Layout className="adm-layout">
        <StyledSider width={280}>
          <Sidebar {...sidebar} />
        </StyledSider>
        <StyledContentLayout>{props.children}</StyledContentLayout>
      </Layout>
    </SimpleLayout>
  );
}
