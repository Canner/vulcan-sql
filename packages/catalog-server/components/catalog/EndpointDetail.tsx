import React from 'react';
import { Table, TableProps, Tabs } from 'antd';
import styled from 'styled-components';
import {
  space,
  SpaceProps,
  layout,
  LayoutProps,
  typography,
  TypographyProps,
  color,
  ColorProps,
} from 'styled-system';
import { EndpointQuery } from '@/graphQL/catalog.graphql.generated';

const TabContent = styled.div<SpaceProps & LayoutProps>`
  ${space}
  ${layout}
`;

const ResultsCountText = styled.div<TypographyProps & SpaceProps & ColorProps>`
  ${typography}
  ${space}
  ${color}
`;

export interface Props {
  data: EndpointQuery['endpoint'];
  loading: boolean;
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
  },
];

const Title = ({ title }) => (
  <ResultsCountText fontSize={0} color="neutralColor4" mb={1} fontWeight={1}>
    {title}
  </ResultsCountText>
);

const CustomizedTable = (props: TableProps<any>) => (
  <Table
    columns={tableColumns}
    pagination={false}
    scroll={{ y: 'calc(50vh - 190px)' }}
    bordered
    {...props}
  />
);

const ColumnsDetail = (props) => {
  const { data, loading } = props;
  const { parameters = [], columns = [] } = data || {};
  const tabContent = [
    {
      label: 'Available Parameters',
      key: 'availableParameters',
      children: (
        <>
          <Title title={`${parameters.length || 0} parameters`} />
          <CustomizedTable dataSource={parameters} loading={loading} />
        </>
      ),
    },
    {
      label: 'Column Information',
      key: 'columnInformation',
      children: (
        <>
          <Title title={`${columns.length || 0} columns`} />
          <CustomizedTable dataSource={columns} loading={loading} />
        </>
      ),
    },
  ];

  return (
    <TabContent mt={3} height="fit-content" maxHeight={`calc(50% - 70px)`}>
      <Tabs items={tabContent} />
    </TabContent>
  );
};

export default ColumnsDetail;
