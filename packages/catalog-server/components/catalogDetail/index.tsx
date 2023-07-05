import { useMemo } from 'react';
import { Tabs, Typography } from 'antd';
import QueryResult from './QueryResult';
import CustomizedTable from './CustomizedTable';
import { Dataset, Endpoint } from './utils';

const { Title } = Typography;

export interface CatalogDetailProps {
  data: Endpoint;
  loading: boolean;
  dataset: Dataset;
  datasetLoading: boolean;
  onDatasetPreview: (options?: any) => Promise<void>;
  datasetError?: any;
}

export default function CatalogDetail(props: CatalogDetailProps) {
  const {
    data,
    loading,
    dataset,
    datasetLoading,
    onDatasetPreview,
    datasetError,
  } = props;
  const parameters = useMemo(() => data?.parameters || [], [data?.parameters]);
  const columns = useMemo(
    () =>
      (data?.columns || []).map((item) => ({
        ...item,
        key: item.name,
      })),
    [data?.columns]
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
    <div>
      <Title level={3}>{data?.name}</Title>
      <QueryResult
        columns={columns}
        parameters={parameters}
        dataset={dataset}
        loading={datasetLoading}
        error={datasetError}
        onDatasetPreview={onDatasetPreview}
      />

      <Tabs>
        {tabItems.map((item) => (
          <Tabs.TabPane key={item.key} tab={item.label}>
            {item.children}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
}
