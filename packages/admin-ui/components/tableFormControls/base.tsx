import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Table, Button, TableColumnProps, Space } from 'antd';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';

interface Props {
  columns: TableColumnProps<any>[];
  value?: Record<string, any>[];
  onChange?: (value: Record<string, any>[]) => void;
}

const setupInternalId = (value: any[]) => {
  return value.map((item) => ({ ...item, _id: uuidv4() }));
};

export const makeTableFormControl = (ModalComponent: React.FC<any>) => {
  const TableFormControl = (props: Props) => {
    const { columns, onChange, value } = props;
    const [internalValue, setInternalValue] = useState(
      setupInternalId(value || [])
    );
    const modalComponent = useModalAction();

    const syncOnChange = () => {
      onChange && onChange(internalValue);
    };

    const tableColumns: TableColumnProps<typeof internalValue>[] = useMemo(
      () => [
        ...columns,
        {
          key: 'action',
          width: 80,
          render: (record) => {
            console.log('edit', record);
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
                  onClick={() => removeCaculatedField(record)}
                >
                  <DeleteOutlined />
                </Button>
              </Space>
            );
          },
        },
      ],
      []
    );

    const removeCaculatedField = (item) => {
      setInternalValue(
        internalValue.filter((record) => record._id !== item._id)
      );
      syncOnChange();
    };

    const submitModal = (item) => {
      console.log('submit', item);
      const isNewItem = !item._id;
      if (isNewItem) item._id = uuidv4();

      setInternalValue(
        isNewItem
          ? [...internalValue, item]
          : internalValue.map((record) =>
              record._id === item._id ? { ...record, ...item } : record
            )
      );
      syncOnChange();
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
        <Button className="mt-2" onClick={() => modalComponent.openModal()}>
          Add
        </Button>
        <ModalComponent
          {...modalComponent.state}
          onClose={modalComponent.closeModal}
          onSubmit={submitModal}
        />
      </>
    );
  };

  return TableFormControl;
};
