import CatalogDetailComponent from '@vulcan-sql/catalog-server/components/catalogDetail';
import {
  DatasetQueryVariables,
  useDatasetLazyQuery,
  useEndpointLazyQuery,
} from '@vulcan-sql/catalog-server/graphQL/catalog.graphql.generated';
import { useStore } from '@vulcan-sql/catalog-server/lib/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function CatalogDetail() {
  const router = useRouter();
  const { setPathNames } = useStore();
  const slug = router.query.slug as string;

  const [fetchEndpoint, { data, loading }] = useEndpointLazyQuery();
  const [
    fetchDataset,
    { data: datasetData, loading: datasetLoading, error: datasetError },
  ] = useDatasetLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (data?.endpoint) {
      setPathNames(['', data.endpoint?.name || '']);
    }
    return () => {
      setPathNames([]);
    };
  }, [setPathNames, data]);

  // get endpoint data
  useEffect(() => {
    if (slug) {
      fetchEndpoint({ variables: { slug: encodeURIComponent(slug) } });
    }
  }, [fetchEndpoint, fetchDataset, slug]);

  // get dataset data
  const onDatasetPreview = (filter?: Pick<DatasetQueryVariables, 'filter'>) => {
    if (data?.endpoint) {
      fetchDataset({
        variables: { endpointSlug: data.endpoint?.slug, filter },
      });
    }
  };

  return (
    <CatalogDetailComponent
      data={data?.endpoint}
      loading={loading}
      dataset={datasetData?.dataset}
      datasetLoading={datasetLoading}
      datasetError={datasetError}
      onDatasetPreview={onDatasetPreview}
    />
  );
}

export default CatalogDetail;
