import React from 'react';
import { Typography } from 'antd';
import Endpoint, { EndpointProps } from './Endpoint';

const { Title } = Typography;

export interface CatalogProps {
  title?: string;
  data: EndpointProps[];
}

export default function Catalog(props: CatalogProps) {
  const { title, data } = props;

  const EndpointList = () => (
    <>
      {data.map((item) => (
        <Endpoint key={item.slug} {...item} />
      ))}
    </>
  );

  return (
    <div>
      {title && <Title level={3}>{title}</Title>}
      <EndpointList />
    </div>
  );
}
