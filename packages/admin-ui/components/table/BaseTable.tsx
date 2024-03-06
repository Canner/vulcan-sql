import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import EllipsisWrapper from '@vulcan-sql/admin-ui/components/EllipsisWrapper';
import CodeBlock from '@vulcan-sql/admin-ui/components/editor/CodeBlock';
import { getColumnTypeIcon } from '@vulcan-sql/admin-ui/utils/columnType';
import {
  ModelColumnData,
  getJoinTypeText,
} from '@vulcan-sql/admin-ui/utils/data';

export const COLUMN = {
  DISPLAY_NAME: {
    title: 'Display name',
    dataIndex: ['properties', 'displayName'],
    width: 140,
    render: (name) => <EllipsisWrapper text={name} />,
  },
  REFERENCE_NAME: {
    title: 'Reference name',
    dataIndex: 'referenceName',
    width: 150,
    render: (name) => <EllipsisWrapper text={name} />,
  },
  TYPE: {
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
  EXPRESSION: {
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
  RELATION: {
    title: 'Relation',
    dataIndex: 'joinType',
    render: (joinType) => getJoinTypeText(joinType),
  },
  DESCRIPTION: {
    title: 'Description',
    dataIndex: 'description',
    width: 200,
    render: (text) => {
      return <EllipsisWrapper text={text} />;
    },
  },
};

type BaseTableProps = TableProps<ModelColumnData>;

export type Props = BaseTableProps & {
  actionColumns?: BaseTableProps['columns'];
};

export default function BaseTable(props: Props) {
  const { dataSource = [], columns = [], actionColumns, ...restProps } = props;

  const tableColumns = useMemo(
    () => columns.concat(actionColumns || []),
    [dataSource]
  );

  const tableData = useMemo(
    () =>
      (dataSource || []).map((record, index) => ({
        ...record,
        key: `${record.id}-${index}`,
      })),
    [dataSource]
  );

  return (
    <Table
      {...restProps}
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
