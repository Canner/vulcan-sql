import { Button } from 'antd';
import { variant } from 'styled-system';
import styled from 'styled-components';

const buttonStyle = variant({
  key: 'buttons',
});

const buttonSizeStyle = variant({
  prop: 'size',
  key: 'buttons.size',
});

type Props = {
  variant?: string;
  size?: string;
};

const StyledButton = styled(Button)<Props>`
  && {
    ${buttonStyle}
    ${buttonSizeStyle}
  }
`;

export default StyledButton;
