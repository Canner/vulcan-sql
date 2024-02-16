import { Layout } from 'antd';
import HeaderBar, {
  Connections,
} from '@vulcan-sql/admin-ui/components/HeaderBar';
import PageLoading from '@vulcan-sql/admin-ui/components/PageLoading';

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
  connections?: Connections;
  loading?: boolean;
}

export default function SimpleLayout(props: Props) {
  const { children, connections, loading } = props;
  return (
    <Layout
      className={`adm-main bg-gray-3${loading ? ' overflow-hidden' : ''}`}
    >
      <HeaderBar connections={connections} />
      <Content className="adm-content">{children}</Content>
      <PageLoading visible={loading} />
    </Layout>
  );
}
