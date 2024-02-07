import { Popover, PopoverProps, Row, Col, Typography } from 'antd';
import styled from 'styled-components';

const Title = styled.h5`
  font-weight: 400;
  font-size: 14px;
  color: var(--gray-7);
  margin-bottom: 0;
`;

type Props = PopoverProps;

export default function CustomPopover(props: Props) {
  const { children } = props;

  return (
    <Popover {...props} mouseLeaveDelay={0} overlayStyle={{ maxWidth: 520 }}>
      {children}
    </Popover>
  );
}

CustomPopover.Row = Row;

CustomPopover.Col = (props: {
  title: string;
  children: React.ReactNode;
  code?: boolean;
  span?: number;
  marginBottom?: number;
}) => {
  const { title, children, code, span = 24, marginBottom = 8 } = props;
  return (
    <Col span={span}>
      <Title>{title}</Title>
      <div style={{ marginBottom }}>
        <Typography.Text code={code}>{children}</Typography.Text>
      </div>
    </Col>
  );
};
