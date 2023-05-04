import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import EndpointList from './EndpointList';

const { Title } = Typography;

const StyledCatalog = styled.div``;

export interface CatalogProps {
  title?: string;
  data: any;
}

export default function Catalog(props: CatalogProps) {
  const { title, data } = props;

  const Endpoint = () =>
    data.map((item) => <EndpointList key={item.slug} {...item} />);

  return (
    <StyledCatalog>
      {title && <Title level={3}>{title}</Title>}
      <Endpoint />
    </StyledCatalog>
  );
}
