import { Modal, Typography, Form, Input, ModalProps } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';
import {
  useEffect,
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  typography,
  TypographyProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
} from 'styled-system';
import Button from '@/components/Button';
import { axiosInstance } from './api';

const { Title } = Typography;

type Props = {
  children?: React.ReactNode;
};

interface User {
  username: string;
}

interface LoginModalProps extends ModalProps {
  canClose?: boolean;
}

interface Auth {
  user: User | null;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  LoginModal: React.FC<LoginModalProps>;
}

const StyledModal = styled(Modal)`
  & .ant-modal-body {
    padding: ${(props) => props.theme.space[4]}px;
  }
`;

const Logo = styled.div<SpaceProps>`
  ${space}
`;

const ModalHeader = styled.div<TypographyProps & SpaceProps>`
  ${typography}
  ${space}
`;

const StyledButton = styled(Button)<LayoutProps>`
  ${layout}
`;

const AuthContext = createContext<Auth>(null);

export const useAuth = (): Auth => {
  const auth = useContext(AuthContext);
  return auth;
};

export const AuthProvider: React.FC<Props> = (props) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // checkout profile
  useEffect(() => {
    const getProfileData = async () => {
      const sessionToken = window.localStorage.getItem('session') || token;
      const response = await axiosInstance.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      setUser(response.data);
    };
    getProfileData();
  }, [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('session'));
    const syncStorageSession = (event: StorageEvent): void => {
      if (event.key === 'session') {
        setToken(event.newValue);
      }
    };

    window.addEventListener('storage', syncStorageSession);
    return () => {
      window.removeEventListener('storage', syncStorageSession);
    };
  }, []);

  const login = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password,
      });

      const { profile, accessToken, refreshToken } = response.data;
      window.localStorage.setItem('session', accessToken);
      window.localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      setUser(profile);
      setLoginModalVisible(false);
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    await axiosInstance.get('/api/auth/logout', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    window.localStorage.removeItem('session');
    window.localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    router.reload();
  }, [router, token]);

  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const LoginModal: React.FC<LoginModalProps> = useCallback(
    (props) => {
      const { canClose = true } = props;
      return (
        <StyledModal
          open={loginModalVisible}
          onCancel={() => setLoginModalVisible(false)}
          footer={null}
          mask
          keyboard={canClose}
          maskClosable={canClose}
          closable={canClose}
          {...props}
        >
          <ModalHeader textAlign="center" mb={2}>
            <Logo mb={3}>
              <Image
                src="/logo.svg"
                alt="vulcan logo"
                width="40px"
                height="44.22px"
              />
            </Logo>
            <Title level={3}>Log in</Title>
          </ModalHeader>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={login}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Please input your Username!' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your Password!' },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '0' }}>
              <StyledButton width="100%" variant="primary" htmlType="submit">
                Log in
              </StyledButton>
            </Form.Item>
          </Form>
        </StyledModal>
      );
    },
    [login, loginModalVisible]
  );

  const auth = useMemo(
    () => ({
      user,
      login,
      logout,
      token,
      LoginModal,
    }),
    [login, LoginModal, logout, token, user]
  );

  return (
    <AuthContext.Provider value={auth} {...props}>
      <LoginModal />
      {props.children}
    </AuthContext.Provider>
  );
};
