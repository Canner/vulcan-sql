import { useAuth } from '@/lib/auth';

export function LoginPage() {
  const { LoginModal } = useAuth();
  return <LoginModal open={true} canClose={false} />;
}

export default LoginPage;
