import styled from 'styled-components';
import PageTitle from '@components/PageTitle';
import EndpointList from './EndpointList';

const StyledCatalog = styled.div``;

/* eslint-disable-next-line */
export interface CatalogProps {
  data: any;
}

export default function Catalog(props: CatalogProps) {
  const { data } = props;

  const Endpoint = () =>
    data.map((item) => <EndpointList key={item.slug} {...item} />);

  return (
    <StyledCatalog>
      <PageTitle title="Catalog" />
      <Endpoint />
    </StyledCatalog>
  );
}
