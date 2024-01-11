import {Layout} from 'antd'
import styled from 'styled-components'
const {Header} = Layout

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
`;

export default function ContentHeader(props) {
  return <StyledHeader>{props.children}</StyledHeader>
} 