import styled from 'styled-components';
import Path from '@lib/path';
import { Card, Button } from 'antd';
import { ApiOutlined } from '@lib/icons';
import { useRouter } from 'next/router';

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

/* eslint-disable-next-line */
export interface EndpointListProps {
  name: string;
  description: string;
  slug: string;
  apiDocUrl: string;
}

export default function Endpoint(props: EndpointListProps) {
  const router = useRouter();
  const {
    name = 'test',
    description = 'No description.',
    slug,
    apiDocUrl,
  } = props;
  return (
    <StyledEndpointList>
      <CardTitle>
        <ApiOutlined />
        {name}
      </CardTitle>
      {description}
      <div className="endpointList-footer">
        <Button onClick={() => router.push(`${Path.Catalog}/${slug}`)}>
          Connect
        </Button>
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
