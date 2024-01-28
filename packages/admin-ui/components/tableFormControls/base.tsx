import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Table, Button, TableColumnProps, Space } from 'antd';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';

interface Props<MData> {
  columns: TableColumnProps<any>[];
  value?: Record<string, any>[];
  disabled?: boolean;
  onChange?: (value: Record<string, any>[]) => void;
  modalProps?: Partial<MData>;
}

const setupInternalId = (value: any[]) => {
  return value.map((item) => ({ ...item, _id: uuidv4() }));
};

export const makeTableFormControl = <MData,>(
  ModalComponent: React.FC<Partial<MData>>
) => {
  const TableFormControl = (props: Props<MData>) => {
    const { columns, onChange, value, modalProps, disabled } = props;
    const [internalValue, setInternalValue] = useState(
      setupInternalId(value || [])
    );
    const modalComponent = useModalAction();

    useEffect(() => {
      onChange && onChange(internalValue);
    }, [internalValue]);

    const tableColumns: TableColumnProps<typeof internalValue>[] = useMemo(
      () => [
        ...columns,
        {
          key: 'action',
          width: 80,
          render: (record) => {
            return (
              <Space>
                <Button
                  type="text"
                  className="px-2"
                  onClick={() => modalComponent.openModal(record)}
                >
                  <EditOutlined />
                </Button>
                <Button
                  type="text"
                  className="px-2"
                  onClick={() => removeData(record._id)}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            );
          },
        },
      ],
      [internalValue]
    );

    const removeData = (id) => {
      setInternalValue(internalValue.filter((record) => record._id !== id));
    };

    const submitModal = (item) => {
      const isNewItem = !item._id;
      if (isNewItem) item._id = uuidv4();

      setInternalValue(
        isNewItem
          ? [...internalValue, item]
          : internalValue.map((record) =>
              record._id === item._id ? { ...record, ...item } : record
            )
      );
    };

    return (
      <>
        {!!internalValue.length && (
          <Table
            rowKey="_id"
            dataSource={internalValue}
            columns={tableColumns}
            pagination={{
              hideOnSinglePage: true,
              pageSize: 10,
              size: 'small',
            }}
          />
        )}
        <Button
          className="mt-2"
          onClick={() => modalComponent.openModal()}
          disabled={disabled}
        >
          Add
        </Button>
        <ModalComponent
          {...modalComponent.state}
          {...modalProps}
          onClose={modalComponent.closeModal}
          onSubmit={submitModal}
        />
      </>
    );
  };

  return TableFormControl;
};