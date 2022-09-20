import HeadTitle from '@/components/HeadTitle';
import EndpointList from '@/components/catalog/EndpointList';

export function CatalogPage(props) {
  return (
    <>
      <HeadTitle title="Catalog">Catalog</HeadTitle>
      <EndpointList />
    </>
  );
}

export default CatalogPage;
