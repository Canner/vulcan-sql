import { useMemo } from 'react';
import { Table, TableProps } from 'antd';
import { MeasureFieldValue } from '@vulcan-sql/admin-ui/components/modals/AddMeasureFieldModal';

type Props = Pick<TableProps<MeasureFieldValue>, 'dataSource'> &
  Partial<Pick<TableProps<MeasureFieldValue>, 'columns'>>;

export const getMeasureFieldTableColumns = () => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: 'Expression',
      dataIndex: 'operator',
      width: 200,
      render: (operator, record) => {
        // TODO: clarify the interface with backend
        if (!operator) return '-';

        const argumentFields = record.modelFields.map((field) => field.name);
        const argumentTexts = argumentFields.join('.');
        return `${operator}${argumentTexts ? `(${argumentTexts})` : ''}`;
      },
    },
  ];
};

export default function MeasureFieldTable(props: Props) {
  const { dataSource = [], columns = [] } = props;

  const tableColumns = useMemo(
    () => [...getMeasureFieldTableColumns(), ...columns],
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
