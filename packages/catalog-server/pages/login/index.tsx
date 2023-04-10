import LoginModal from '@vulcan-sql/catalog-server/components/LoginModal';
import { useAuth } from '@vulcan-sql/catalog-server/lib/auth';
import Path from '@vulcan-sql/catalog-server/lib/path';
import { useStore } from '@vulcan-sql/catalog-server/lib/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';

/* eslint-disable-next-line */
export interface LoginProps {}

const StyledLogin = styled.div``;

export default function Login(props: LoginProps) {
  const router = useRouter();
  const { loginModal, setLoginModal } = useStore();
  const { token, login } = useAuth();

  const setLoginModalState = (data) =>
    setLoginModal((state) => ({ ...state, ...data }));

  const onLoginModalClose = () => setLoginModalState({ visible: false });

  const onLogin = async (data) => {
    setLoginModalState({ hasError: false });
    try {
      await login(data);

      onLoginModalClose();
      router.push(Path.Home);
    } catch (error) {
      setLoginModalState({ hasError: true });
    }
  };

  useEffect(() => {
    setLoginModalState({ visible: true, canClose: false });

    return () => {
      setLoginModalState({ canClose: true });
    };
  }, []);

  useEffect(() => {
    if (token) router.push(Path.Home);
  }, [router, token]);

  return (
    <StyledLogin>
      <LoginModal
        canClose={loginModal.canClose}
        hasError={loginModal.hasError}
        visible={loginModal.visible}
        onSubmit={onLogin}
        onClose={onLoginModalClose}
      />
    </StyledLogin>
  );
}
