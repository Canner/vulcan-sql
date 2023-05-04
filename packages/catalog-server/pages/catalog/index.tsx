import CatalogComponent from '@vulcan-sql/catalog-server/components/catalog';
import { useEndpointsQuery } from '@vulcan-sql/catalog-server/graphQL/catalog.graphql.generated';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Path from '@vulcan-sql/catalog-server/lib/path';

export function Catalog() {
  const router = useRouter();
  const { data } = useEndpointsQuery();

  const endpoints = useMemo(() => {
    return (data?.endpoints || []).map((endpoint) => ({
      ...endpoint,
      onConnect: () => {
        router.push(`${Path.Catalog}/${endpoint.slug}`);
      },
    }));
  }, [data?.endpoints]);
  return <CatalogComponent title="Catalog" data={endpoints} />;
}

export default Catalog;
