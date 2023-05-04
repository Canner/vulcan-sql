import React from 'react';
import styled from 'styled-components';
import { Card, Button } from 'antd';
import { ApiOutlined } from './utils';

const StyledEndpointList = styled(Card)`
  .endpointList-footer {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    * + * {
      margin-left: 16px;
    }
  }
  + .ant-card {
    margin-top: 24px;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 700;
  color: var(--gray-8);

  .anticon {
    margin-right: 8px;
  }
`;

export interface EndpointListProps {
  name: string;
  description: string;
  apiDocUrl: string;
  onConnect: () => void;
}

export default function Endpoint(props: EndpointListProps) {
  const {
    name = 'test',
    description = 'No description.',
    apiDocUrl,
    onConnect,
  } = props;
  return (
    <StyledEndpointList>
      <CardTitle>
        <ApiOutlined />
        {name}
      </CardTitle>
      {description}
      <div className="endpointList-footer">
        <Button onClick={onConnect}>Connect</Button>
        <Button
          type="primary"
          href={apiDocUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View API Docs
        </Button>
      </div>
    </StyledEndpointList>
  );
}
