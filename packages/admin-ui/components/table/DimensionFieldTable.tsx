import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { DimensionFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddDimensionFieldModal';

type Props = Pick<TableProps<DimensionFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<DimensionFieldValue>, 'columns'>>;

export const getDimensionFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'fieldName',
    },
  ];
};

export default function DimensionFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getDimensionFieldTableColumns(), ...columns],
    [dataSource]
  );

  return (
    <Table
      rowKey={(record, index) => `${record.fieldName}-${index}`}
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
