import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { get } from 'lodash';
import { Form, Input, InputRef, FormInstance } from 'antd';
import { Props as BaseTableProps } from '@vulcan-sql/admin-ui/components/table/BaseTable';

interface Props extends BaseTableProps {
  propertyName: string;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  propertyName: string;
  dataIndex: string;
  index: number;
  record: any;
  handleSave: (record: any) => void;
}

export const EditableContext = createContext<FormInstance<any> | null>(null);

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  propertyName,
  dataIndex,
  index,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  const dataIndexKey = Array.isArray(dataIndex)
    ? dataIndex.join('.')
    : dataIndex;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    const value = get(record, dataIndexKey);
    console.log(value);

    // const values = form.getFieldsValue(true) || {};
    // console.log(values);
    // form.setFieldsValue({ [propertyName]: values[rowIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave(values);
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const childNode = editing ? (
    <Form.Item
      style={{ margin: 0 }}
      name={[propertyName, index]}
      rules={[
        {
          required: true,
          message: `${title} is required.`,
        },
      ]}
    >
      <Input ref={inputRef} onPressEnter={save} onBlur={save} />
    </Form.Item>
  ) : (
    <div
      className="editable-cell-value-wrap"
      style={{ paddingRight: 24 }}
      onClick={toggleEdit}
    >
      {children}
    </div>
  );

  return <td {...restProps}>{childNode}</td>;
};

export const makeEditableBaseTable = (BaseTable: React.FC<BaseTableProps>) => {
  const EditableBaseTable = (props: Props) => {
    const { propertyName, columns, dataSource } = props;
    const [data, setData] = useState(dataSource);
    const components = { body: { cell: EditableCell } };

    const handleSave = (values: any) => {
      const newData = [...dataSource];
      const index = newData.findIndex((item) => values.key === item.key);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...values,
      });
      setData(newData);
    };

    const tableColumns = columns.map((column, index) => ({
      ...column,
      onCell: (record) => ({
        title: column.title,
        propertyName,
        dataIndex: (column as any).dataIndex,
        index,
        record,
        handleSave,
      }),
    })) as Props['columns'];

    return (
      <BaseTable
        {...props}
        dataSource={data}
        columns={tableColumns}
        components={components}
      />
    );
  };

  return EditableBaseTable;
};
