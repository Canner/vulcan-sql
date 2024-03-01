import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { CalculatedFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddCalculatedFieldModal';
import CodeBlock from '../editor/CodeBlock';

type Props = Pick<TableProps<CalculatedFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<CalculatedFieldValue>, 'columns'>>;

export const getCalculatedFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: 'Expression',
      dataIndex: 'expression',
      render: (expression) => {
        return <CodeBlock code={expression} inline />;
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
