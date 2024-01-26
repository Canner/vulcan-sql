import { Layout } from 'antd';
import HeaderBar from '@vulcan-sql/admin-ui/components/HeaderBar';

const { Content } = Layout;

export default function SimpleLayout(props) {
  return (
    <Layout className="adm-main bg-gray-3">
      <HeaderBar />
      <Content className="adm-content">{props.children}</Content>
    </Layout>
  );
}
