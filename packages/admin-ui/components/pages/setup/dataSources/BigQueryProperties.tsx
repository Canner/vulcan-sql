import { useState } from 'react';
import { Form, Input, Button, Upload } from 'antd';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import { UploadFile } from 'antd/lib/upload/interface';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';

export default function BigQueryProperties() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onUploadChange = (info) => {
    const { fileList } = info;
    if (fileList.length) {
      const uploadFile = fileList[0];
      setFileList([uploadFile]);
    }
  };

  return (
    <>
      <Form.Item
        label="Display name"
        required
        name="displayName"
        extra="The name will be called in VulcanSQL."
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.DISPLAY_NAME.REQUIRED,
          },
        ]}
      >
        <Input placeholder="Our BigQuery" />
      </Form.Item>
      <Form.Item
        label="Project ID"
        required
        name="projectId"
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.PROJECT_ID.REQUIRED,
          },
        ]}
      >
        <Input placeholder="Project-123" />
      </Form.Item>
      <Form.Item
        label="Credentials"
        required
        name="credential"
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.CONNECTION.CREDENTIAL.REQUIRED,
          },
        ]}
      >
        <Upload
          accept=".json"
          fileList={fileList}
          onChange={onUploadChange}
          onRemove={() => setFileList([])}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>
            Click to upload JSON key file
          </Button>
        </Upload>
      </Form.Item>
    </>
  );
}
