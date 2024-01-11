import { Layout } from 'antd';
import styled from 'styled-components';
import LogoBar from '../LogoBar';

const { Header, Content } = Layout;

const StyledHeader = styled(Header)`
  height: 54px;
  border-bottom: 1.5px solid var(--Netural-Color-4, #f0f0f0);
`;

export default function SimpleLayout(props) {
  return (
    <Layout className="adm-main bg-gray-3">
      <StyledHeader>
        <LogoBar />
      </StyledHeader>
      <Content>{props.children}</Content>
    </Layout>
  );
}
