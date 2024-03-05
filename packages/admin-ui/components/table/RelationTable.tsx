import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { getJoinTypeText } from '@vulcan-sql/admin-ui/utils/data';
import { RelationFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddRelationModal';
import EllipsisWrapper from '@vulcan-sql/admin-ui/components/EllipsisWrapper';

type Props = Pick<TableProps<RelationFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<RelationFieldValue>, 'columns'>>;

export const getRelationTableColumns = () => {
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
      title: 'Relation',
      dataIndex: 'joinType',
      render: (joinType) => getJoinTypeText(joinType),
    },
  ];
};

export default function RelationTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getRelationTableColumns(), ...columns],
    [dataSource]
  );

  const tableData = useMemo(
    () =>
      (dataSource || []).map((record, index) => ({
        ...record,
        key: `${record.relationName}-${index}`,
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
