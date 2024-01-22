import { Modal, Form, Input, Select } from 'antd';
import ModelFieldSelector from '@vulcan-sql/admin-ui/components/modelFieldSelector';
import useModelFieldOptions from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';

interface Props {
  model: string;
  visible: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export default function AddCaculatedFieldModal(props: Props) {
  const { model, visible, onSubmit, onClose } = props;
  const [form] = Form.useForm();

  const options = useModelFieldOptions();

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit();
        onClose();
      })
      .catch(console.error);
  };

  return (
    <Modal
      title="Add caculated fields"
      width={750}
      visible={visible}
      okText="Submit"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={false}
      maskClosable={false}
      destroyOnClose
    >
      <Form form={form} preserve={false} layout="vertical">
        <Form.Item
          label="Field name"
          name="fieldName"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_CACULATED_FIELD.FIELD_NAME,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Select an expression"
          name="expression"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_CACULATED_FIELD.EXPRESSION,
            },
          ]}
        >
          <Select />
        </Form.Item>
        <div className="py-1" />
        <Form.Item
          name="modelField"
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_CACULATED_FIELD.MODEL_FIELD,
            },
          ]}
        >
          <ModelFieldSelector model={model} options={options} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
