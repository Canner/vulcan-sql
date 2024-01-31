import { useMemo } from 'react';
import { Table, TableProps } from 'antd';

type Props = Pick<TableProps<any>, 'dataSource'> &
  Partial<Pick<TableProps<any>, 'columns'>>;

export const getFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: 'Type',
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

  return (
    <Table
      rowKey={(record, index) => `${record.name}-${index}`}
      dataSource={dataSource}
      showHeader={dataSource.length > 0}
      columns={tableColumns}
      pagination={{
        hideOnSinglePage: true,
        pageSize: 10,
        size: 'small',
      }}
    />
  );
}
