import { Form, Input, Button } from 'antd';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

export default function BigQueryProperties() {
  return (
    <>
      <Form.Item
        label="Display name"
        required
        name="displayName"
        extra="The name will be called in VulcanSQL."
        rules={[{ required: true, message: 'Please input display name.' }]}
      >
        <Input placeholder="Our BigQuery" />
      </Form.Item>
      <Form.Item
        label="Project ID"
        required
        name="projectId"
        rules={[{ required: true, message: 'Please input project ID.' }]}
      >
        <Input placeholder="project-123" />
      </Form.Item>
      <Form.Item
        label="Credentials"
        required
        name="credential"
        rules={[{ required: true, message: 'Please upload Credentials.' }]}
      >
        <Button icon={<UploadOutlined />}>Click to upload JSON key file</Button>
      </Form.Item>
    </>
  );
}
