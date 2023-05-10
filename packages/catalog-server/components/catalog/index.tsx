import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import Endpoint, { EndpointProps } from './Endpoint';

const { Title } = Typography;

const StyledCatalog = styled.div``;

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
    <StyledCatalog>
      {title && <Title level={3}>{title}</Title>}
      <EndpointList />
    </StyledCatalog>
  );
}
