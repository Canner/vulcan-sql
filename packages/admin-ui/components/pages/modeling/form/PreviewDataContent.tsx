import { Table, TableColumnProps } from 'antd';

interface Props {
  columns: TableColumnProps<any>[];
  data: any[];
}

export default function PreviewDataContent(props: Props) {
  const { columns = [], data = [] } = props;
  const hasColumns = !!columns.length;
  return (
    <Table
      className={hasColumns ? 'ant-table-has-header' : ''}
      showHeader={hasColumns}
      dataSource={data}
      columns={columns}
      pagination={{ hideOnSinglePage: true, pageSize: 50, size: 'small' }}
      scroll={{ y: 280 }}
    />
  );
}
