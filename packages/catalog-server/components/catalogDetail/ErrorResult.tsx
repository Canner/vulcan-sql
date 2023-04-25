import { Result } from 'antd';
import styled from 'styled-components';

const StyledErrorResult = styled(Result)`
  .ant-result-icon > .anticon {
    font-size: 70px;
  }
`;

type Props = {
  subTitle?: React.ReactNode | string;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function ErrorResult(props: Props) {
  const { subTitle, extra, style } = props;
  return (
    <StyledErrorResult
      status="error"
      title="Something went wrong."
      subTitle={subTitle}
      extra={extra}
      style={style}
    />
  );
}
