import { Form, FormInstance, Radio, Select, Button, Space } from 'antd';
import Editor from '@vulcan-sql/admin-ui/components/editor';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';
import CaculatedFieldTableFormControl from '@vulcan-sql/admin-ui/components/tableFormControls/CaculatedFieldTableFormControl';
import PreviewDataContent from './PreviewDataContent';

export interface ButtonProps {
  onPreview: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ModelDetailForm(props: { form: FormInstance }) {
  const { form } = props;

  const RADIO_VALUE = {
    TABLE: 'table',
    CUSTOM: 'custom',
  };

  const source = Form.useWatch('source', form);
  return (
    <Form form={form} layout="vertical">
      <Form.Item label="Create model from" name="source" initialValue="table">
        <Radio.Group>
          <Radio value={RADIO_VALUE.TABLE}>Table</Radio>
          <Radio value={RADIO_VALUE.CUSTOM}>Custom SQL statement</Radio>
        </Radio.Group>
      </Form.Item>
      {source === RADIO_VALUE.TABLE && (
        <Form.Item
          label="Select a table"
          name="table"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.MODELING_CREATE_MODEL.TABLE.REQUIRED,
            },
          ]}
        >
          <Select
            placeholder="Select a table"
            options={[{ label: '1', value: '1' }]}
          />
        </Form.Item>
      )}

      {source === RADIO_VALUE.CUSTOM && (
        <Form.Item
          name="customSQL"
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.MODELING_CREATE_MODEL.CUSTOM_SQL.REQUIRED,
            },
          ]}
        >
          <Editor autoCompleteSource={[]} />
        </Form.Item>
      )}

      <Form.Item
        label="Select fields"
        name="fields"
        required
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.MODELING_CREATE_MODEL.FIELDS.REQUIRED,
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select fields"
          options={[{ label: '1', value: '1' }]}
        />
      </Form.Item>

      <Form.Item label="Caculated fields" name="caculatedFields">
        <CaculatedFieldTableFormControl columns={[{}]} />
      </Form.Item>

      <Form.Item label="Data preview (50 rows)">
        <PreviewDataContent columns={[]} data={[]} />
      </Form.Item>
    </Form>
  );
}

export const ButtonGroup = (props: ButtonProps) => {
  const { onPreview, onCancel, onBack, onSubmit } = props;
  return (
    <div className="d-flex justify-space-between">
      <Button onClick={onPreview}>Preview data</Button>
      <Space className="d-flex justify-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onBack}>Back</Button>
        <Button type="primary" onClick={onSubmit}>
          Submit
        </Button>
      </Space>
    </div>
  );
};
