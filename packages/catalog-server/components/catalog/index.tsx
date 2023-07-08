import React from 'react';
import { Typography } from 'antd';
import Endpoint, { EndpointProps } from './Endpoint';
import Loading from '../Loading';

const { Title } = Typography;

export interface CatalogProps {
  title?: string;
  data: EndpointProps[];
  loading: boolean;
}

export default function Catalog(props: CatalogProps) {
  const { title, data, loading } = props;

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
      {loading ? <Loading /> : <EndpointList />}
    </div>
  );
}
