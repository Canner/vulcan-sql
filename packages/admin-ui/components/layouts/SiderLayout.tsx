import { Layout } from 'antd';
import styled from 'styled-components';
import SimpleLayout from '@vulcan-sql/admin-ui/components/layouts/SimpleLayout';
import Sidebar from '@vulcan-sql/admin-ui/components/sidebar';

const { Sider } = Layout;

const StyledContentLayout = styled(Layout)`
  position: relative;
`;

export default function SiderLayout(props) {
  const { connections, sidebar } = props;
  return (
    <SimpleLayout connections={connections}>
      <Layout className="adm-layout">
        <Sider width={280}>
          <Sidebar {...sidebar} />
        </Sider>
        <StyledContentLayout>{props.children}</StyledContentLayout>
      </Layout>
    </SimpleLayout>
  );
}
