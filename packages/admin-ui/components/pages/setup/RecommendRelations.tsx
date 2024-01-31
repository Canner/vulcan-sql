import Link from 'next/link';
import { Button, Col, Form, Row, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ModelRelationSelectionTable, {
  RelationsDataType,
} from '@vulcan-sql/admin-ui/components/table/ModelRelationSelectionTable';
import { SelectedRecommendRelations } from '@vulcan-sql/admin-ui/components/pages/setup/DefineRelations';
import {
  makeIterable,
  IterableComponent,
} from '@vulcan-sql/admin-ui/utils/iteration';
import { getJoinTypeText } from '@vulcan-sql/admin-ui/utils/data';

const { Title, Text } = Typography;

interface Props {
  // TODO: update type when connecting to backend
  recommendRelations: Array<{
    name: string;
    relations: RelationsDataType[];
  }>;
  onNext: (data: SelectedRecommendRelations) => void;
  onBack: () => void;
}

export const columns: ColumnsType<RelationsDataType> = [
  {
    title: 'From field',
    dataIndex: 'fromField',
    key: 'fromField',
    render: (fromField) => `${fromField.model}.${fromField.field}`,
    width: '35%',
  },
  {
    title: 'To field',
    dataIndex: 'toField',
    key: 'toField',
    render: (toField) => `${toField.model}.${toField.field}`,
    width: '35%',
  },
  {
    title: 'Relation',
    dataIndex: 'relationType',
    key: 'relationType',
    render: (type, relation) => (
      <>
        {getJoinTypeText(type)}
        {relation.isAutoGenerated && (
          <Text className="pl-1" type="secondary">
            (auto-generated)
          </Text>
        )}
      </>
    ),
    width: '30%',
  },
];

const SelectRelationTemplate: IterableComponent = ({
  name,
  index,
  relations,
}) => (
  <Form.Item key={name} className="mt-6" name={name}>
    <ModelRelationSelectionTable
      columns={columns}
      enableRowSelection
      dataSource={relations}
      tableTitle={name}
      rowKey={(record: RelationsDataType) =>
        `${name}-${record.relationName}-${index}`
      }
    />
  </Form.Item>
);

export default function RecommendRelations(props: Props) {
  const { recommendRelations, onBack, onNext } = props;
  const [form] = Form.useForm();

  const SelectRelationIterator = makeIterable(SelectRelationTemplate);

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
        <SelectRelationIterator data={recommendRelations} />
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
