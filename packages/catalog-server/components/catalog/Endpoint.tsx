import React from 'react';
import styled from 'styled-components';
import { Card, Button } from 'antd';
import ApiOutlined from '@ant-design/icons/ApiOutlined';

const StyledEndpoint = styled(Card)`
  .endpoint-footer {
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

export interface EndpointProps {
  slug: string;
  name: string;
  description?: string;
  apiDocUrl: string;
  onConnect: () => void;
}

export default function Endpoint(props: EndpointProps) {
  const { name = 'test', description, apiDocUrl, onConnect } = props;
  return (
    <StyledEndpoint>
      <CardTitle>
        <ApiOutlined />
        {name}
      </CardTitle>
      {description || (
        <span style={{ color: 'var(--gray-6)' }}>No Description</span>
      )}
      <div className="endpoint-footer">
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
    </StyledEndpoint>
  );
}
