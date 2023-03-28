import { useEffect } from 'react';
import styled from 'styled-components';
import { Avatar, Dropdown, Layout as AntdLayout, Menu, Row, Col } from 'antd';
import Breadcrumb from './Breadcrumb';
import LoginModal from '@vulcan-sql/catalog-server/components/LoginModal';
import { useRouter } from 'next/router';
import { UserOutlined } from '@vulcan-sql/catalog-server/lib/icons';
import { useStore } from '@vulcan-sql/catalog-server/lib/store';
import Path from '@vulcan-sql/catalog-server/lib/path';
import { useAuth } from '@vulcan-sql/catalog-server/lib/auth';

const { Header, Content } = AntdLayout;

const StyledAntdLayout = styled(AntdLayout)`
  min-height: 100vh;

  .ant-layout-header {
    border-bottom: 1px rgba(0, 0, 0, 0.03) solid;
  }
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
`;

/* eslint-disable-next-line */
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;
  const router = useRouter();
  const { user, pathNames, loginModal, setLoginModal } = useStore();
  const { getProfile, login, logout } = useAuth();
  const isLogin = Boolean(user);

  useEffect(() => {
    getProfile({ redirectTo: Path.Login });
  }, []);

  const onLoginModalClose = () =>
    setLoginModal({ ...loginModal, visible: false });

  const onLogin = async (data) => {
    await login(data);
    onLoginModalClose();
    router.push(Path.Home);
  };

  const onLogout = async () => {
    await logout();
    router.push(Path.Login);
  };

  const menu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: user ? user.name : 'Guest',
        },
        {
          key: 'logout',
          label: user ? (
            <div onClick={onLogout}>Log out</div>
          ) : (
            <div onClick={() => router.push(Path.Login)}>Log in</div>
          ),
        },
      ]}
    />
  );

  return (
    <StyledAntdLayout>
      {isLogin && (
        <Header>
          <Row wrap={false}>
            <Col flex={1}>
              <Breadcrumb pathNames={pathNames} />
            </Col>
            <Col>
              <Dropdown overlay={menu} placement="bottomRight">
                {user ? (
                  <StyledAvatar
                    size={25}
                    style={{ backgroundColor: 'var(--geekblue-6)' }}
                  >
                    {user.name.charAt(0)}
                  </StyledAvatar>
                ) : (
                  <StyledAvatar size={25} icon={<UserOutlined />} />
                )}
              </Dropdown>
            </Col>
          </Row>
        </Header>
      )}
      <Content style={{ height: '100%', padding: '32px 50px' }}>
        {children}

        <LoginModal
          canClose={loginModal.canClose}
          visible={loginModal.visible}
          onSubmit={onLogin}
          onClose={onLoginModalClose}
        />
      </Content>
    </StyledAntdLayout>
  );
}
