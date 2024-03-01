import { useMemo } from 'react';
import { Table, TableColumnProps } from 'antd';
import { isString } from 'lodash';

interface Props {
  columns: TableColumnProps<any>[];
  data: any[];
}

const FONT_SIZE = 16;
const BASIC_COLUMN_WIDTH = 100;

export default function PreviewDataContent(props: Props) {
  const { columns = [], data = [] } = props;
  const hasColumns = !!columns.length;

  const dynamicWidth = useMemo(() => {
    return columns.reduce((result, column) => {
      const width = isString(column.title)
        ? (column.title as string).length * FONT_SIZE
        : BASIC_COLUMN_WIDTH;
      return result + width;
    }, 0);
  }, [columns]);

  const tableColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      ellipsis: true,
    }));
  }, [columns]);

  return (
    <Table
      className={hasColumns ? 'ant-table-has-header' : ''}
      showHeader={hasColumns}
      dataSource={data}
      columns={tableColumns}
      pagination={{ hideOnSinglePage: true, pageSize: 50, size: 'small' }}
      scroll={{ y: 280, x: dynamicWidth }}
    />
  );
}
