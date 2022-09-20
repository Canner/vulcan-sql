import React from 'react';
import { useRouter } from 'next/router';
import EndpointDetail from '@/components/catalog/EndpointDetail';
import QueryResults from '@/components/catalog/QueryResults';
import {
  useDatasetQuery,
  useEndpointQuery,
} from '@/graphQL/catalog.graphql.generated';

const Catalog = () => {
  const router = useRouter();
  const { slug } = router.query;

  const { data: endpointDataQuery, loading: endpointDataQueryLoading } =
    useEndpointQuery({
      fetchPolicy: 'cache-and-network',
      variables: { slug: slug as string },
    });

  const {
    data: dataSetQuery,
    loading: datasetQueryloading,
    refetch: refetchDataSet,
  } = useDatasetQuery({
    fetchPolicy: 'cache-and-network',
    variables: { endpointSlug: slug as string, filter: {} },
  });

  return (
    <>
      <QueryResults
        datasetData={dataSetQuery?.dataset}
        endpointData={endpointDataQuery?.endpoint}
        loading={endpointDataQueryLoading || datasetQueryloading}
        refetch={refetchDataSet}
      />
      <EndpointDetail
        data={endpointDataQuery?.endpoint}
        loading={endpointDataQueryLoading}
      />
    </>
  );
};

export default Catalog;
