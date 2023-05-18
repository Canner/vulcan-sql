import styled from 'styled-components';
import { Form, Input, Modal, Button, Typography, Alert } from 'antd';
import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import Image from 'next/image';

const { Title } = Typography;

export interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: object) => Promise<void>;
  hasError: boolean;
  canClose?: boolean;
}

const StyledLoginModal = styled(Modal)`
  .ant-modal-body {
    padding: 32px;
  }
`;

const ModalHeader = styled.div`
  text-align: center;

  .ant-typography {
    margin: 16px 0;
  }
`;

export function LoginModal(props: LoginModalProps) {
  const { visible, onClose, onSubmit, canClose = true, hasError } = props;
  return (
    <StyledLoginModal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={464}
      mask={false}
      keyboard={canClose}
      maskClosable={canClose}
      closable={canClose}
      destroyOnClose={true}
    >
      <ModalHeader>
        <Image
          src="/logo.svg"
          alt="vulcan logo"
          width="40px"
          height="44.22px"
        />
        <Title level={3}>Log in</Title>
      </ModalHeader>
      <Form
        name="normal_login"
        initialValues={{ remember: true }}
        onFinish={onSubmit}
      >
        {hasError && (
          <Alert
            message="Invalid username or password."
            type="error"
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Button block type="primary" htmlType="submit">
          Log in
        </Button>
      </Form>
    </StyledLoginModal>
  );
}

export default LoginModal;
