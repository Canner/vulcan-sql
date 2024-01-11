import { Layout } from 'antd';

const { Sider, Content } = Layout;

export default function Explore() {
  return <Layout className="adm-main">
    <Sider width={272}>
      </Sider>
      <Content>
        Explore
      </Content>
  </Layout>;
}
