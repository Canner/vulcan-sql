import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { CalculatedFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddCalculatedFieldModal';
import CodeBlock from '@vulcan-sql/admin-ui/components/editor/CodeBlock';
import EllipsisWrapper from '@vulcan-sql/admin-ui/components/EllipsisWrapper';

type Props = Pick<TableProps<CalculatedFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<CalculatedFieldValue>, 'columns'>>;

export const getCalculatedFieldTableColumns = () => {
  return [
    {
      title: 'Display name',
      dataIndex: ['properties', 'displayName'],
      width: 125,
      render: (name) => <EllipsisWrapper text={name} />,
    },
    {
      title: 'Reference name',
      dataIndex: 'referenceName',
      width: 140,
      render: (name) => <EllipsisWrapper text={name} />,
    },
    {
      title: 'Expression',
      dataIndex: 'expression',
      render: (expression) => {
        return (
          <EllipsisWrapper text={expression}>
            <CodeBlock code={expression} inline />
          </EllipsisWrapper>
        );
      },
    },
  ];
};

export default function CalculatedFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getCalculatedFieldTableColumns(), ...columns],
    [dataSource]
  );

  const tableData = useMemo(
    () =>
      (dataSource || []).map((record, index) => ({
        ...record,
        key: `${record.name}-${index}`,
      })),
    [dataSource]
  );

  return (
    <Table
      dataSource={tableData}
      showHeader={tableData.length > 0}
      columns={tableColumns}
      pagination={{
        hideOnSinglePage: true,
        pageSize: 10,
        size: 'small',
      }}
    />
  );
}
