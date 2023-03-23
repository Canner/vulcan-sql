import styled from 'styled-components';
import CatalogDetailComponent from '@components/catalogDetail';
import {
  DatasetQueryVariables,
  useDatasetLazyQuery,
  useEndpointLazyQuery,
} from 'graphQL/catalog.graphql.generated';
import { useRouter } from 'next/router';
import { useStore } from '@lib/store';
import { useEffect } from 'react';

/* eslint-disable-next-line */
export interface CatalogDetailProps {}

const StyledCatalogDetail = styled(CatalogDetailComponent)``;

export function CatalogDetail(props: CatalogDetailProps) {
  const router = useRouter();
  const { setPathNames } = useStore();
  const slug = router.query.slug as string;

  const [fetchEndpoint, { data, loading }] = useEndpointLazyQuery();
  const [fetchDataset, { data: datasetData, loading: datasetLoading }] =
    useDatasetLazyQuery({ fetchPolicy: 'cache-and-network' });

  useEffect(() => {
    if (data?.endpoint) {
      setPathNames(['', data.endpoint?.name || '']);
    }
    return () => {
      setPathNames([]);
    };
  }, [setPathNames, data]);

  useEffect(() => {
    if (slug) {
      fetchEndpoint({ variables: { slug } });
    }
  }, [fetchEndpoint, fetchDataset, slug]);

  const onDatasetPreview = (filter?: Pick<DatasetQueryVariables, 'filter'>) => {
    if (data?.endpoint) {
      fetchDataset({
        variables: { endpointSlug: data.endpoint?.slug, filter },
      });
    }
  };

  return (
    <StyledCatalogDetail
      data={data?.endpoint || {}}
      loading={loading}
      dataset={datasetData?.dataset || {}}
      datasetLoading={datasetLoading}
      onDatasetPreview={onDatasetPreview}
    />
  );
}

export default CatalogDetail;
