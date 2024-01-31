import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { WindowFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddWindowFieldModal';

type Props = Pick<TableProps<WindowFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<WindowFieldValue>, 'columns'>>;

export const getWindowFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'fieldName',
    },
  ];
};

export default function WindowFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getWindowFieldTableColumns(), ...columns],
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
