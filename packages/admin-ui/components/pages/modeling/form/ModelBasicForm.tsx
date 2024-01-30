import { Form, FormInstance, Space, Button } from 'antd';
import BasicInfoProperties from './BasicInfoProperties';
import CacheProperties from './CacheProperties';
import { FORM_MODE } from '@vulcan-sql/admin-ui/utils/enum';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';

export interface ButtonProps {
  onCancel: () => void;
  onNext: () => void;
}

export default function ModelBasicForm(props: {
  form: FormInstance;
  formMode: FORM_MODE;
}) {
  const { form } = props;
  return (
    <Form form={form} layout="vertical">
      <BasicInfoProperties
        form={form}
        label="Model name"
        name="modelName"
        errorTexts={ERROR_TEXTS.MODELING_CREATE_MODEL}
      />
      <CacheProperties form={form} />
    </Form>
  );
}

export const ButtonGroup = (props: ButtonProps) => {
  const { onNext, onCancel } = props;
  return (
    <Space className="d-flex justify-end">
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={onNext}>
        Next
      </Button>
    </Space>
  );
};
