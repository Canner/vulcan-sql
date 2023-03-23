import { useMemo } from 'react';
import styled from 'styled-components';
import { Tabs } from 'antd';
import PageTitle from '@components/PageTitle';
import QueryResult from './QueryResult';
import CustomizedTable from './CustomizedTable';
import { Dataset } from '@lib/__generated__/types';

const StyledCatalogDetail = styled.div``;

/* eslint-disable-next-line */
export interface CatalogDetailProps {
  data: any;
  loading: boolean;
  dataset: Dataset;
  datasetLoading: boolean;
  onDatasetPreview: (options?: any) => void;
}

export default function CatalogDetail(props: CatalogDetailProps) {
  const { data, loading, dataset, datasetLoading, onDatasetPreview } = props;
  const parameters = useMemo(() => data.parameters || [], [data.parameters]);
  const columns = useMemo(
    () =>
      (data.columns || []).map((item: any) => ({
        ...item,
        key: item.name,
      })),
    [data.columns]
  );

  const tabItems = [
    {
      key: 'parameters',
      label: 'Available Parameters',
      children: (
        <CustomizedTable
          dataSource={parameters}
          loading={loading}
          unit="parameters"
        />
      ),
    },
    {
      key: 'columns',
      label: 'Column Information',
      children: (
        <CustomizedTable
          dataSource={columns}
          loading={loading}
          unit="columns"
        />
      ),
    },
  ];

  return (
    <StyledCatalogDetail>
      <PageTitle title={data.name} />
      <QueryResult
        columns={columns}
        parameters={parameters}
        dataset={dataset}
        loading={datasetLoading}
        onDatasetPreview={onDatasetPreview}
      />

      <Tabs items={tabItems} />
    </StyledCatalogDetail>
  );
}
