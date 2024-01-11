import { Layout } from 'antd';
import Sidebar from '@vulcan-sql/admin-ui/components/sidebar';

const { Sider, Content } = Layout;

export default function SiderLayout(props) {
  const { sidebar } = props;
  return (
    <Layout className="adm-main">
      <Sider width={280}>
        <Sidebar {...sidebar} />
      </Sider>
      <Content>{props.children}</Content>
    </Layout>
  );
}
