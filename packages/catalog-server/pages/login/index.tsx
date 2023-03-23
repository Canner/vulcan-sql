import Path from '@lib/path';
import { useStore } from '@lib/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';

/* eslint-disable-next-line */
export interface LoginProps {}

const StyledLogin = styled.div``;

export default function Login(props: LoginProps) {
  const router = useRouter();
  const { token, loginModal, setLoginModal } = useStore();

  useEffect(() => {
    setLoginModal({ ...loginModal, visible: true, canClose: false });

    return () => {
      setLoginModal({ ...loginModal, canClose: true });
    };
  }, []);

  useEffect(() => {
    if (token) router.push(Path.Home);
  }, [router, token]);

  return <StyledLogin></StyledLogin>;
}
