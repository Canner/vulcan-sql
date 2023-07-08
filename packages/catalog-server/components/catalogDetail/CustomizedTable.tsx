import React from 'react';
import styled from 'styled-components';
import { Table, TableProps, ConfigProvider, Empty, SpinProps } from 'antd';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

const StyledCustomizedTable = styled.div`
  .customizedTable {
    &-count {
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 12px;
      color: var(--gray-8);
    }
  }
`;

interface CustomizedTableProps extends TableProps<Record<string, any>> {
  unit?: string;
  renderUnit?: (data: any) => string;
}

const tableColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: '20%',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    width: '60%',
    render: (text) => {
      return text || '-';
    },
  },
];

export default function CustomizedTable(props: CustomizedTableProps) {
  const { unit, renderUnit, dataSource, loading, ...restProps } = props;
  const countString = renderUnit
    ? renderUnit(dataSource)
    : `${dataSource.length} ${unit}`;
  return (
    <StyledCustomizedTable>
      <div className="customizedTable-count">{countString}</div>

      <ConfigProvider
        renderEmpty={() => (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No Results"
          />
        )}
      >
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          pagination={false}
          loading={
            {
              spinning: loading,
              indicator: <LoadingOutlined style={{ fontSize: 24 }} spin />,
            } as SpinProps
          }
          {...restProps}
        />
      </ConfigProvider>
    </StyledCustomizedTable>
  );
}
