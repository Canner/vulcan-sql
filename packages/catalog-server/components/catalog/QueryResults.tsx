import React from 'react';
import styled from 'styled-components';
import { Typography, Table, Popover, Dropdown, Menu, Space, Empty } from 'antd';
import { FilterOutlined, DownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  space,
  SpaceProps,
  layout,
  LayoutProps,
  border,
  BorderProps,
  typography,
  TypographyProps,
  color,
  ColorProps,
  flexbox,
  FlexboxProps,
} from 'styled-system';
import { isEmpty } from 'lodash';
import Button from '@/components/Button';
import SelectParameters, {
  ParameterProps,
} from '@/components/catalog/ParametersForm';
import {
  DatasetQuery,
  EndpointQuery,
} from '@/graphQL/catalog.graphql.generated';

const { Title } = Typography;

const ResultsContent = styled.div<SpaceProps & LayoutProps>`
  ${space}
  ${layout} // height: calc(50% - 10px - ${(props) => props.theme.space[3]}px);
`;
const TitleContent = styled.div<LayoutProps & BorderProps & SpaceProps>`
  ${layout}
  ${border}
  ${space}
`;

const ResultsCountText = styled.div<TypographyProps & SpaceProps & ColorProps>`
  ${typography}
  ${space}
  ${color}
`;

const StyledButton = styled(Button).withConfig({
  shouldForwardProp: (prop) => !['alignItems'].includes(prop),
})<SpaceProps & LayoutProps & FlexboxProps>`
  ${space}
  ${layout}
  ${flexbox}
`;

const StylesCountText = styled.span<
  ColorProps & SpaceProps & LayoutProps & BorderProps & TypographyProps
>`
  ${color}
  ${space}
  ${layout}
  ${border}
  ${typography}
`;

export interface Props {
  datasetData: DatasetQuery['dataset'];
  endpointData: EndpointQuery['endpoint'];
  loading: boolean;
  refetch: (object) => void;
}

const ResultsDetail: React.FC<Props> = (props) => {
  const { datasetData, endpointData, loading, refetch } = props;
  const [filter, SetParameters] = React.useState({});

  const ParametersCount = React.useCallback(() => {
    const count = Object.values(filter).filter((v) => !isEmpty(v)).length;
    if (count > 0)
      return (
        <StylesCountText
          width="20px"
          height="20px"
          lineHeight="1.4"
          color="neutralColor1"
          bg="primaryColor1"
          borderRadius="100px"
        >
          {count}
        </StylesCountText>
      );

    return null;
  }, [filter]);

  const {
    data: resultsData = [],
    apiUrl,
    csvDownloadUrl,
    jsonDownloadUrl,
  } = datasetData || {};

  const { columns = [], parameters = [] } = endpointData || {};

  const resultsColumns: ColumnsType<unknown> = columns.map((val, index) => {
    return {
      title: val.name,
      dataIndex: val.name,
      key: val.name,
      ...(index === 0 && { fixed: 'left' }),
      ...(index === columns.length - 1 && { fixed: 'right' }),
    };
  });

  const connectMenu = (
    <Menu
      onClick={() => null}
      items={[
        {
          label: (
            <a href={apiUrl} target="_blank" rel="noopener noreferrer">
              Copy API URL
            </a>
          ),
          key: 'copyApiUrl',
          disabled: !apiUrl,
        },
        {
          label: (
            <a href={csvDownloadUrl} target="_blank" rel="noopener noreferrer">
              Download as CSV
            </a>
          ),
          key: 'downloadAsCsv',
          disabled: !csvDownloadUrl,
        },
        {
          label: (
            <a href={jsonDownloadUrl} target="_blank" rel="noopener noreferrer">
              Download as JSON
            </a>
          ),
          key: 'DownloadAsJson',
          disabled: !jsonDownloadUrl,
        },
      ]}
    />
  );

  const onSubmit = async (data) => {
    SetParameters(data);
    refetch({ filter: data });
  };

  return (
    <ResultsContent my={3} height="fit-content" maxHeight={`calc(50% - 70px)`}>
      <TitleContent
        display="flex"
        borderBottom={1}
        borderBottomColor="borderColor1"
        borderBottomStyle="solid"
        my={2}
      >
        <Title level={4}>Results</Title>

        <Popover
          placement="bottomRight"
          content={
            <SelectParameters
              // TODO: wait api fix type
              parameters={parameters as unknown as ParameterProps[]}
              onSubmit={onSubmit}
            />
          }
          trigger="click"
        >
          <StyledButton
            mr={2}
            ml="auto"
            display="flex"
            alignItems="center"
            icon={<FilterOutlined />}
          >
            Select Parameters &nbsp; <ParametersCount />
          </StyledButton>
        </Popover>

        <Dropdown overlay={connectMenu}>
          <StyledButton variant="primary">
            <Space>
              Connect
              <DownOutlined />
            </Space>
          </StyledButton>
        </Dropdown>
      </TitleContent>

      <ResultsCountText
        fontSize={0}
        color="neutralColor4"
        my={1}
        fontWeight={1}
      >
        {resultsData.length || 0} results
      </ResultsCountText>
      {isEmpty(resultsData) ? (
        <Empty />
      ) : (
        <Table
          columns={resultsColumns}
          dataSource={resultsData}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(50vh - 290px)' }}
        />
      )}
    </ResultsContent>
  );
};

export default ResultsDetail;
