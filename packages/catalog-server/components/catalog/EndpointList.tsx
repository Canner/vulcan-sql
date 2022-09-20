import styled from 'styled-components';
import { Card } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import {
  typography,
  TypographyProps,
  space,
  SpaceProps,
  layout,
  LayoutProps,
  flexbox,
  FlexboxProps,
  color,
  ColorProps,
} from 'styled-system';
import Button from '@/components/Button';
import { useRouter } from 'next/router';
import { useEndpointsQuery } from '@/graphQL/catalog.graphql.generated';

const StyledCard = styled(Card)<SpaceProps>`
  && {
    ${space}
  }
  .ant-card-body {
    padding: 0;
  }
`;

const CardTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => !['alignItems'].includes(prop),
})<LayoutProps & FlexboxProps & SpaceProps>`
  ${layout}
  ${flexbox}
  ${space}
`;

const StyledApiOutlined = styled(ApiOutlined)<SpaceProps>`
  ${space}
`;

const CardTitleText = styled.span<TypographyProps & ColorProps>`
  ${typography}
  ${color}
`;

const CardContent = styled.div<TypographyProps & SpaceProps>`
  ${typography}
  ${space}
`;
const Content = styled.div<SpaceProps>`
  ${space}
`;

const CardFooter = styled.div<SpaceProps>`
  float: right;
  ${space}
`;

const StyledButton = styled(Button)<SpaceProps>`
  ${space}
`;

export function EndpointList() {
  const router = useRouter();

  const { data, loading, error } = useEndpointsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const endpointList = data.endpoints.map(
    ({ name, description, apiDocUrl, slug }) => {
      return (
        <StyledCard key={name} p={2} my={3}>
          <CardTitle mb={2} display="flex" alignItems="center">
            <StyledApiOutlined mr={1} />
            <CardTitleText fontSize={1} fontWeight={2} color="gray">
              {name}
            </CardTitleText>
          </CardTitle>

          <CardContent my={2} fontSize={1} fontWeight={0}>
            {description || 'No description.'}
          </CardContent>
          <CardFooter mt="6">
            <StyledButton
              mx={2}
              onClick={() =>
                router.push({
                  pathname: 'catalog/[slug]',
                  query: { slug },
                })
              }
            >
              Connect
            </StyledButton>
            <StyledButton variant="primary">
              <a href={apiDocUrl} target="_blank" rel="noopener noreferrer">
                View API Docs
              </a>
            </StyledButton>
          </CardFooter>
        </StyledCard>
      );
    }
  );

  return <Content mt={6}>{endpointList}</Content>;
}

export default EndpointList;
