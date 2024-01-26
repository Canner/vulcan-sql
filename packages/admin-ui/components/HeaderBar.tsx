import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Button, ButtonProps, Layout, Space } from 'antd';
import LogoBar from '@vulcan-sql/admin-ui/components/LogoBar';

const { Header } = Layout;

enum Path {
  Onboarding = '/setup',
  Modeling = '/modeling',
  Explore = '/explore',
}

const StyledButton = styled(Button).attrs<{
  $isHighlight: boolean;
}>((props) => ({
  shape: 'round',
  size: 'small',
  style: {
    background: props.$isHighlight ? 'rgba(255, 255, 255, 0.20)' : '#000',
    fontWeight: props.$isHighlight ? '700' : 'normal',
    border: 'none',
    color: 'var(--gray-1)',
  },
}))`` as React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLDivElement> & { $isHighlight: boolean }
>;

const StyledHeader = styled(Header)`
  height: 48px;
  border-bottom: 1px solid var(--gray-5);
  background: #000;
  padding: 10px 16px;
`;

export default function HeaderBar() {
  const router = useRouter();
  const { pathname } = router;
  const showNav = !pathname.startsWith(Path.Onboarding);

  return (
    <StyledHeader>
      <Space size={[24, 0]}>
        <LogoBar />
        {showNav && (
          <Space size={[16, 0]}>
            <StyledButton
              $isHighlight={pathname.startsWith(Path.Explore)}
              onClick={() => router.push(Path.Explore)}
            >
              Explore
            </StyledButton>
            <StyledButton
              $isHighlight={pathname.startsWith(Path.Modeling)}
              onClick={() => router.push(Path.Modeling)}
            >
              Modeling
            </StyledButton>
          </Space>
        )}
      </Space>
    </StyledHeader>
  );
}
