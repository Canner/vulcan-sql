import styled from 'styled-components';
import CatalogComponent from '@vulcan-sql/catalog-server/components/catalog';
import { useEndpointsQuery } from '@vulcan-sql/catalog-server/graphQL/catalog.graphql.generated';

/* eslint-disable-next-line */
export interface CatalogProps {}

const StyledCatalog = styled(CatalogComponent)``;

export function Catalog(props: CatalogProps) {
  const { data } = useEndpointsQuery();
  return <StyledCatalog data={data?.endpoints || []} />;
}

export default Catalog;
