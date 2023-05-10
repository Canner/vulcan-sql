import React, { useMemo, useState } from 'react';
import { Typography, Button, Badge, Dropdown, Space, Menu } from 'antd';
import styled from 'styled-components';
import CustomizedTable from './CustomizedTable';
import ParameterForm from './ParameterForm';
import TutorialModal, { TutorialType } from './TutorialModal';
import ErrorResult from './ErrorResult';
import { Column, Dataset, Parameter } from './utils';
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';

const { Title } = Typography;

const StyledQueryResult = styled.div`
  .queryResult {
    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 40px;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 1px var(--gray-4) solid;

      .ant-typography {
        margin: 0;
      }
    }
    &-btnGroup {
      position: relative;
      display: flex;
      flex-wrap: nowrap;
      > * + * {
        margin-left: 16px;
      }
    }
    &-btnTrigger {
      position: relative;

      .ant-btn {
        .anticon {
          margin-right: 4px;
        }
      }
    }
    &-parameterForm {
      position: absolute;
      right: 0;
      z-index: 10;
      margin-top: 8px;
    }
    &-table {
      margin-bottom: 36px;
    }
  }

  .ant-badge {
    display: block;
  }
  .ant-badge-count {
    background-color: var(--geekblue-6);
  }

  .ant-dropdown-menu-item-group-title {
    font-weight: 700;
    font-size: 12px;
    color: var(--gray-8);
  }
  .ant-dropdown-menu-item-group-list {
    margin: 0;
  }
`;

export interface QueryResultProps {
  columns: Column[];
  parameters: Parameter[];
  dataset: Dataset;
  loading: boolean;
  onDatasetPreview: (options?: any) => void;
  error?: any;
}

export default function QueryResult(props: QueryResultProps) {
  const { dataset, parameters, columns, loading, onDatasetPreview, error } =
    props;
  const [parameterFormVisible, setParameterFormVisible] = useState(false);
  const [parameterCount, setParameterCount] = useState(0);
  const hasDataset = Object.keys(dataset || {}).length > 0;
  const hasCount = parameterCount > 0;
  const {
    data = [],
    apiUrl = '',
    csvDownloadUrl = '',
    jsonDownloadUrl = '',
    metadata,
  } = dataset || {};
  const [tutorialModalProps, setTutorialModalProps] = useState({
    type: null,
    visible: false,
  });
  const closeTutorialModal = () =>
    setTutorialModalProps((state) => ({ ...state, visible: false }));

  const tableColumns = useMemo(
    () =>
      Object.keys(data[0] || {}).map((name) => {
        const column = columns.find((col) => col.name === name);
        return {
          title: column?.name || name,
          dataIndex: name,
          key: name,
          onCell: () => ({
            style: { minWidth: 160, maxWidth: 300 },
          }),
        };
      }),
    [data, columns]
  );

  const resultData = useMemo(
    () =>
      hasCount
        ? data.map((item, index) => ({
            ...item,
            key: `${JSON.stringify(item)}${index}`,
          }))
        : [],
    [data, hasCount]
  );

  const onParameterFormReset = () => {
    setParameterCount(0);
    setParameterFormVisible(false);
  };

  const onParameterFormSubmit = (values) => {
    const count = Object.values(values).reduce(
      (acc: number, cur) => (cur ? acc + 1 : acc),
      0
    ) as number;
    onDatasetPreview(values);
    setParameterCount(count);
    setParameterFormVisible(false);
  };

  const menu = (
    <Menu
      style={{ width: 160 }}
      items={[
        {
          label: 'Copy API URL',
          key: 'copy-api-url',
          onClick: () => {
            navigator.clipboard.writeText(apiUrl);
          },
        },
        ...(csvDownloadUrl
          ? [
              {
                label: (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={csvDownloadUrl}
                    download
                  >
                    Download as CSV
                  </a>
                ),
                key: 'download-as-csv',
              },
            ]
          : []),
        ...(jsonDownloadUrl
          ? [
              {
                label: (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={jsonDownloadUrl}
                    download
                  >
                    Download as JSON
                  </a>
                ),
                key: 'download-as-json',
              },
            ]
          : []),
        { type: 'divider' },
        {
          label: 'Connect From',
          type: 'group',
          key: 'connect-from',
        },
        {
          label: 'Excel',
          key: 'excel',
          onClick: () => {
            setTutorialModalProps({
              type: TutorialType.EXCEL,
              visible: true,
            });
          },
        },
        {
          label: 'Google Spreadsheet',
          key: 'google-spreadsheet',
          onClick: () => {
            setTutorialModalProps({
              type: TutorialType.GOOGLE_SPREADSHEET,
              visible: true,
            });
          },
        },
        {
          label: 'Zapier',
          key: 'zapier',
          onClick: () => {
            setTutorialModalProps({
              type: TutorialType.ZAPIER,
              visible: true,
            });
          },
        },
        {
          label: 'Retool',
          key: 'retool',
          onClick: () => {
            setTutorialModalProps({
              type: TutorialType.RETOOL,
              visible: true,
            });
          },
        },
      ]}
    />
  );

  return (
    <StyledQueryResult>
      <div className="queryResult-header">
        <Title level={4}>Results</Title>
        <div className="queryResult-btnGroup">
          <div className="queryResult-btnTrigger">
            <Button
              icon={<FilterOutlined />}
              type={hasCount ? 'primary' : 'default'}
              ghost={hasCount}
              onClick={() => setParameterFormVisible(!parameterFormVisible)}
            >
              <Space align="center">
                Select Parameters
                <Badge count={parameterCount} />
              </Space>
            </Button>
            {/* trigger form */}
            <ParameterForm
              className="queryResult-parameterForm"
              visible={parameterFormVisible}
              loading={loading}
              parameters={parameters}
              onReset={onParameterFormReset}
              onSubmit={onParameterFormSubmit}
            />
          </div>
          <div>
            {/* May meet problem with `overlay` prop after 4.24.0, it changes to `menu` prop */}
            <Dropdown
              disabled={!hasCount || !hasDataset}
              overlay={menu}
              placement="topRight"
              getPopupContainer={(trigger) => trigger.parentElement!}
            >
              <Button type="primary">
                <Space align="center">
                  Connect
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorResult subTitle={error?.message} style={{ marginBottom: 36 }} />
      ) : (
        <CustomizedTable
          className="queryResult-table"
          tableLayout="auto"
          showHeader={resultData.length > 0}
          columns={tableColumns}
          dataSource={resultData}
          loading={loading}
          scroll={{ y: 300, x: 'max-content' }}
          renderUnit={() =>
            metadata
              ? `${metadata.currentCount} of ${metadata.totalCount} Results`
              : ''
          }
        />
      )}

      <TutorialModal
        visible={tutorialModalProps.visible}
        type={tutorialModalProps.type}
        codeContent={dataset?.shareJsonUrl}
        onCancel={closeTutorialModal}
        onOk={closeTutorialModal}
        destroyOnClose={true}
      />
    </StyledQueryResult>
  );
}
