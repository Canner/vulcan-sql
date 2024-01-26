import { Table, TableColumnProps } from 'antd';

interface Props {
  columns: TableColumnProps<any>[];
  data: any[];
}

export default function PreviewDataContent(props: Props) {
  const { columns = [], data = [] } = props;
  return (
    <Table
      showHeader={!!columns.length}
      dataSource={data}
      pagination={{ hideOnSinglePage: true, pageSize: 50, size: 'small' }}
      scroll={{ y: 280 }}
    />
  );
}
