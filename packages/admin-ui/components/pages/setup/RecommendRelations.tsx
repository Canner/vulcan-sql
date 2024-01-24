import Link from 'next/link';
import { Button, Col, Form, Row, Typography } from 'antd';
import SelectionRelationTable, {
  RelationsDataType,
} from '@vulcan-sql/admin-ui/components/table/SelectionRelationTable';

const { Title, Text } = Typography;

interface Props {
  // TODO: update type when connecting to backend
  recommendRelations: Array<{
    name: string;
    relations: RelationsDataType[];
  }>;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function RecommendRelations(props: Props) {
  const { recommendRelations, onBack, onNext } = props;
  const [form] = Form.useForm();

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        onNext && onNext({ selectedRecommendRelations: values });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Title level={1} className="mb-3">
        Define the relations
      </Title>
      <Text>
        After creating your data models in step 2, you can specify how they
        should be joined together by defining the relationships. We will
        automatically create the relations based on the 'primary' and 'foreign'
        in your data sources.{` `}
        <Link href="" target="_blank" rel="noopener noreferrer">
          Learn more
        </Link>
      </Text>

      <Form form={form} layout="vertical" className="my-6">
        {recommendRelations.map((modal) => (
          <Form.Item key={modal.name} className="mt-6" name={modal.name}>
            <SelectionRelationTable
              enableRowSelection
              dataSource={modal.relations}
              title={modal.name}
            />
          </Form.Item>
        ))}
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
    </>
  );
}
