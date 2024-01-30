import { useMemo } from 'react';
import Link from 'next/link';
import { Button, Col, Form, Row, Typography } from 'antd';
import { getColumnTypeIcon } from '@vulcan-sql/admin-ui/utils/columnType';
import {
  makeIterable,
  IterableComponent,
} from '@vulcan-sql/admin-ui/utils/iteration';
import SelectionRelationTable from '@vulcan-sql/admin-ui/components/table/SelectionRelationTable';

const { Title, Text } = Typography;

interface Props {
  onNext: (data: { models: any }) => void;
  onBack: () => void;
  selectedModels: string[];
  tables: any;
}

const columns = [
  {
    title: 'Field name',
    dataIndex: 'name',
    width: '65%',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: '35%',
    render: (type) => (
      <div className="d-flex align-center">
        {getColumnTypeIcon({ type }, { className: 'mr-1' })}
        {type}
      </div>
    ),
  },
];

const SelectModelTemplate: IterableComponent = ({ name, fields }) => (
  <Form.Item
    className="mt-6"
    key={name}
    name={name}
    rules={[{ required: true, message: 'Please select a field.' }]}
  >
    <SelectionRelationTable
      columns={columns}
      enableRowSelection
      dataSource={fields}
      title={name}
    />
  </Form.Item>
);

export default function CreateModels(props: Props) {
  const { onBack, onNext, selectedModels, tables } = props;

  const [form] = Form.useForm();

  const selectModelFields = useMemo(() => {
    return selectedModels.map((modelName) => {
      const table = tables.find((table) => table.displayName === modelName);
      return {
        name: modelName,
        fields: table.columns,
      };
    });
  }, [selectedModels, tables]);

  const SelectModelIterator = makeIterable(SelectModelTemplate);

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        onNext && onNext({ models: { ...values } });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <Title level={1} className="mb-3">
        Create data model from tables
      </Title>
      <Text>
        Data models are created directly from your data source tables. It act as
        a “view” of your underlying table to transform and extend on the
        original data.{` `}
        <Link href="" target="_blank" rel="noopener noreferrer">
          Learn more
        </Link>
      </Text>

      <Form form={form} layout="vertical" className="my-6">
        <SelectModelIterator data={selectModelFields} />
      </Form>

      <Row gutter={16} className="pt-6">
        <Col span={12}>
          <Button onClick={onBack} size="large" block>
            Back
          </Button>
        </Col>
        <Col className="text-right" span={12}>
          <Button type="primary" size="large" block onClick={submit}>
            Next
          </Button>
        </Col>
      </Row>
    </div>
  );
}
