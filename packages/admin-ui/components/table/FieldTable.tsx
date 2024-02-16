import { useMemo } from 'react';
import { Table, TableProps } from 'antd';

type Props = Pick<TableProps<{ name: string; type: string }>, 'dataSource'> &
  Partial<Pick<TableProps<{ name: string; type: string }>, 'columns'>>;

export const getFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: 'Type',
      width: 150,
      dataIndex: 'type',
    },
  ];
};

export default function FieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getFieldTableColumns(), ...columns],
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
