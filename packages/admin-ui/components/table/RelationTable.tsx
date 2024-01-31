import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { getJoinTypeText } from '@vulcan-sql/admin-ui/utils/data';
import { RelationFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddRelationModal';

type Props = Pick<TableProps<RelationFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<RelationFieldValue>, 'columns'>>;

export const getRelationTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'relationName',
      width: 150,
    },
    {
      title: 'Relation',
      dataIndex: 'relationType',
      render: (relationType) => getJoinTypeText(relationType),
    },
  ];
};

export default function RelationTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getRelationTableColumns(), ...columns],
    [dataSource]
  );

  return (
    <Table
      rowKey={(record, index) => `${record.relationName}-${index}`}
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
