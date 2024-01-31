import { Space, Button, TableProps } from 'antd';
import EditOutlined from '@ant-design/icons/EditOutlined';
import React, { useMemo } from 'react';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';

interface Props<MData> {
  dataSource: any[];
  metadataIndex?: Record<string, string>;
  onEditValue?: (value: any) => any;
  onSubmitRemote?: (value: any) => void;
  modalProps?: Partial<MData>;
}

const defaultIndex = {
  description: 'description',
};

export const getMetadataColumns = (
  dataIndex: Record<string, string> = defaultIndex
) => [
  {
    title: 'Description',
    dataIndex: dataIndex?.description,
    width: 220,
    render: (text) => text || '-',
  },
];

export const makeMetadataBaseTable =
  <TData,>(BaseTable: React.FC<Partial<TableProps<TData>>>) =>
  <MData,>(ModalComponent?: React.FC<Partial<MData>>) => {
    const isEditable = !!ModalComponent;

    const MetadataBaseTable = (props: Props<MData>) => {
      const {
        dataSource,
        metadataIndex,
        onEditValue = (value) => value,
        onSubmitRemote,
        modalProps,
      } = props;

      const modalComponent = useModalAction();

      const actionColumns = useMemo(
        () =>
          isEditable
            ? [
                {
                  key: 'action',
                  width: 80,
                  render: (record) => {
                    return (
                      <Space className="d-flex justify-end">
                        <Button
                          type="text"
                          className="px-2"
                          onClick={() =>
                            modalComponent.openModal(onEditValue(record))
                          }
                        >
                          <EditOutlined />
                        </Button>
                      </Space>
                    );
                  },
                },
              ]
            : [],
        [dataSource]
      );

      const submitModal = async (values: any) => {
        onSubmitRemote && (await onSubmitRemote(values));
      };

      return (
        <>
          <BaseTable
            dataSource={dataSource}
            columns={[...getMetadataColumns(metadataIndex), ...actionColumns]}
          />
          {isEditable && (
            <ModalComponent
              {...modalComponent.state}
              {...modalProps}
              onClose={modalComponent.closeModal}
              onSubmit={submitModal}
            />
          )}
        </>
      );
    };

    return MetadataBaseTable;
  };
