import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { DimensionFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddDimensionFieldModal';

type Props = Pick<TableProps<DimensionFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<DimensionFieldValue>, 'columns'>>;

export const getDimensionFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
  ];
};

export default function DimensionFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getDimensionFieldTableColumns(), ...columns],
    [dataSource]
  );

  const tableData = useMemo(
    () =>
      (dataSource || []).map((record, index) => ({
        ...record,
        key: `${record.fieldName}-${index}`,
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
