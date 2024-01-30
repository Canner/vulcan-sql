import Link from 'next/link';
import { Button, Col, Form, Row, Typography } from 'antd';
import MultiSelectBox from '@vulcan-sql/admin-ui/components/table/MultiSelectBox';

const { Title, Text } = Typography;

interface Props {
  tables: any;
  onNext: (data: { selectedModels: string[] }) => void;
  onBack: () => void;
}

const columns = [
  {
    title: 'Table name',
    dataIndex: 'displayName',
  },
];

export default function SelectModels(props: Props) {
  const { tables, onBack, onNext } = props;
  const [form] = Form.useForm();

  const items = tables.map((item) => ({
    ...item,
    value: item.displayName,
  }));

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        onNext && onNext({ selectedModels: values.models });
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
      <div className="my-6">
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="models"
            rules={[{ required: true, message: 'Please select a table.' }]}
          >
            <MultiSelectBox columns={columns} items={items} />
          </Form.Item>
        </Form>
      </div>
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