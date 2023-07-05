import { useEffect } from 'react';
import styled from 'styled-components';
import { Avatar, Dropdown, Layout as AntdLayout, Menu, Row, Col } from 'antd';
import Breadcrumb from './Breadcrumb';
import { useRouter } from 'next/router';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { useStore } from '@vulcan-sql/catalog-server/lib/store';
import Path from '@vulcan-sql/catalog-server/lib/path';
import { useAuth } from '@vulcan-sql/catalog-server/lib/auth';

const { Header, Content } = AntdLayout;

const StyledAntdLayout = styled(AntdLayout)`
  min-height: 100vh;
  overflow-x: hidden;

  .ant-layout-header {
    border-bottom: 1px rgba(0, 0, 0, 0.03) solid;
  }
`;

const StyledAvatar = styled.div`
  cursor: pointer;

  .ant-avatar {
    margin-top: -3px;
    margin-right: 8px;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;
  const router = useRouter();
  const { user, getProfile, logout } = useAuth();
  const { pathNames } = useStore();

  const isLogin = Boolean(user);
  const isHeaderShow = router.pathname !== Path.Login;

  const onLogout = async () => {
    await logout();
    router.push(Path.Login);
  };

  useEffect(() => {
    getProfile({ redirectTo: Path.Login });
  }, []);

  const menu = isLogin ? (
    <Menu
      items={[
        {
          key: 'logout',
          label: 'Log Out',
          onClick: onLogout,
        },
      ]}
    />
  ) : null;

  return (
    <StyledAntdLayout>
      {isHeaderShow && (
        <Header>
          <Row wrap={false}>
            <Col flex={1}>
              <Breadcrumb pathNames={pathNames} />
            </Col>
            <Col>
              {isLogin ? (
                <Dropdown overlay={menu} placement="bottomRight">
                  <StyledAvatar>
                    <Avatar
                      size={25}
                      style={{ backgroundColor: 'var(--geekblue-6)' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{user.name}</span>
                  </StyledAvatar>
                </Dropdown>
              ) : (
                <StyledAvatar>
                  <Avatar size={25} icon={<UserOutlined />} />
                  <span>Guest</span>
                </StyledAvatar>
              )}
            </Col>
          </Row>
        </Header>
      )}
      <Content style={{ height: '100%', padding: '32px 50px' }}>
        {children}
      </Content>
    </StyledAntdLayout>
  );
}
