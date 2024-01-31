import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { CaculatedFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';

type Props = Pick<TableProps<CaculatedFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<CaculatedFieldValue>, 'columns'>>;

export const getCaculatedFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'fieldName',
      width: 150,
    },
    {
      title: 'Expression',
      dataIndex: 'expression',
      render: (expression, record) => {
        // TODO: clarify the interface with backend
        const argumentFields = record.modelFields.map((field) => field.name);
        const argumentTexts = argumentFields.join('.');
        return `${expression}${argumentTexts ? `(${argumentTexts})` : ''}`;
      },
    },
  ];
};

export default function CaculatedFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getCaculatedFieldTableColumns(), ...columns],
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
