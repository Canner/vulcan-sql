import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import EllipsisWrapper from '@vulcan-sql/admin-ui/components/EllipsisWrapper';
import { getColumnTypeIcon } from '@vulcan-sql/admin-ui/utils/columnType';

type Props = Pick<TableProps<{ name: string; type: string }>, 'dataSource'> &
  Partial<Pick<TableProps<{ name: string; type: string }>, 'columns'>>;

export const getFieldTableColumns = () => {
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
      title: 'Type',
      dataIndex: 'type',
      render: (type) => {
        return (
          <div className="d-flex align-center">
            {getColumnTypeIcon({ type }, { className: 'mr-2' })}
            {type}
          </div>
        );
      },
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
