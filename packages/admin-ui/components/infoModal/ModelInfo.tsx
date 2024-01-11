import { useMemo } from 'react';
import { JOIN_TYPE, ModelData, Relationship } from '@vulcan-sql/admin-ui/utils/data/model';
import { Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';

const { Title, Paragraph } = Typography;

interface Props {
  data: ModelData;
}

const getJoinTypeText = (type) =>
  ({
    [JOIN_TYPE.MANY_TO_ONE]: 'Many to One',
    [JOIN_TYPE.ONE_TO_MANY]: 'One to Many',
    [JOIN_TYPE.ONE_TO_ONE]: 'One to One',
  }[type] || 'Unknown');

export default function ModelInfo(props: Props) {
  const { data } = props;
  const relationships = useMemo(() => {
    return (data?.relationships || []).map((relationship, index) => ({
      ...relationship,
      key: `${index}-"${relationship.condition}"`,
    }));
  }, [data?.relationships]);
  const relationshipColumns: ColumnsType<Relationship> = [
    {
      title: 'Type',
      key: 'type',
      dataIndex: 'joinType',
      render: (text) => getJoinTypeText(text),
    },
    {
      title: 'From',
      key: 'from',
      dataIndex: 'condition',
      render: (text) => {
        return text.split('=')[0];
      },
    },
    {
      title: 'To',
      key: 'to',
      dataIndex: 'condition',
      render: (text) => {
        return text.split('=')[1];
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

      <div>
        <Title level={5}>SQL Statement</Title>
        <Paragraph style={{ marginBottom: 0 }}>
          <pre style={{ marginBottom: 0 }}>{data?.refSql}</pre>
        </Paragraph>
      </div>

      {relationships.length > 0 ? (
        <div>
          <Title level={5}>Relationship</Title>
          <Table
            dataSource={relationships}
            columns={relationshipColumns}
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
