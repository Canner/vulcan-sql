import { useMemo } from 'react';
import { METRIC_TYPE, MetricData, TimeGrain } from '@vulcan-sql/admin-ui/utils/data/model';
import { Space, Table, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';

const { Title, Paragraph } = Typography;

interface Props {
  data: MetricData;
}

export default function MetricInfo(props: Props) {
  const { data } = props;
  const timeGrains = useMemo(() => {
    return (data?.columns || []).reduce(
      (result, column, index) =>
        result.concat(
          column.metricType === METRIC_TYPE.TIME_GRAIN
            ? [{ ...column, key: index + column.metricType }]
            : []
        ),
      []
    );
  }, [data?.columns]);
  const timeGrainColumns: ColumnsType<TimeGrain> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Time Grain',
      key: 'timeGrain',
      dataIndex: 'dateParts',
      render: (dateParts: string[]) => {
        return dateParts.map((datePart, index) => (
          <Tag key={index}>{datePart.toLowerCase()}</Tag>
        ));
      },
    },
  ];

  const expressions = useMemo(() => {
    return (data?.columns || []).reduce((result, column) => {
      return result.concat(
        column.expression
          ? [
              {
                name: column.name,
                expression: column.expression,
                key: column.id,
              },
            ]
          : []
      );
    }, []);
  }, [data?.columns]);
  const expressionColumns: ColumnsType<any> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Expression',
      key: 'expression',
      dataIndex: 'expression',
    },
  ];
  return (
    <Space style={{ width: '100%' }} direction="vertical" size={[0, 32]}>
      <div>
        <Title level={5}>Description</Title>
        <Paragraph style={{ marginBottom: 0 }}>
          {data?.description || (
            <span style={{ color: 'var(--gray-6)' }}>No Description</span>
          )}
        </Paragraph>
      </div>

      {timeGrainColumns.length > 0 ? (
        <div>
          <Title level={5}>Time Grains</Title>
          <Table
            dataSource={timeGrains}
            columns={timeGrainColumns}
            pagination={false}
          />
        </div>
      ) : null}

      {expressions.length > 0 ? (
        <div>
          <Title level={5}>Expression</Title>
          <Table
            dataSource={expressions}
            columns={expressionColumns}
            pagination={false}
          />
        </div>
      ) : null}
    </Space>
  );
}
