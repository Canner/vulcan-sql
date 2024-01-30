import { Layout } from 'antd';
import HeaderBar, {
  Connections,
} from '@vulcan-sql/admin-ui/components/HeaderBar';

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
  connections?: Connections;
}

export default function SimpleLayout(props: Props) {
  const { children, connections = {} } = props;
  return (
    <Layout className="adm-main bg-gray-3">
      <HeaderBar connections={connections} />
      <Content className="adm-content">{children}</Content>
    </Layout>
  );
}
