import { Table, TableColumnProps } from 'antd';
import styled from 'styled-components';

const Wrapper = styled.div`
  .ant-table-has-header {
    .ant-table-empty {
      border: 1px solid var(--gray-4);
    }
  }
`;

interface Props {
  columns: TableColumnProps<any>[];
  data: any[];
}

export default function PreviewDataContent(props: Props) {
  const { columns = [], data = [] } = props;
  const hasColumns = !!columns.length;
  return (
    <Wrapper>
      <Table
        className={hasColumns ? 'ant-table-has-header' : ''}
        showHeader={hasColumns}
        dataSource={data}
        columns={columns}
        pagination={{ hideOnSinglePage: true, pageSize: 50, size: 'small' }}
        scroll={{ y: 280 }}
      />
    </Wrapper>
  );
}
