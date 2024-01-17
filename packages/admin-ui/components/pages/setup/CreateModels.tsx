import { Row, Col, Button } from 'antd';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function CreateModels(props: Props) {
  const { onBack, onNext } = props;

  const submit = () => {
    onNext && onNext();
  };

  return (
    <div>
      Create Models
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
