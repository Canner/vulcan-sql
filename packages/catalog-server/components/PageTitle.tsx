import { Typography } from 'antd';

const { Title } = Typography;

/* eslint-disable-next-line */
export interface PageTitleProps {
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  return <Title level={3}>{title}</Title>;
}
