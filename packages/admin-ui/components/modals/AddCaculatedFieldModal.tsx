import { Modal, Form, Input, Typography } from 'antd';
import ModelFieldSelector from '@vulcan-sql/admin-ui/components/selectors/modelFieldSelector';
import DescriptiveSelector from '@vulcan-sql/admin-ui/components/selectors/DescriptiveSelector';
import useModelFieldOptions from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';
import { modelFieldSelectorValidator } from '@vulcan-sql/admin-ui/utils/validator';
import useExpressionFieldOptions, {
  CUSTOM_EXPRESSION_VALUE,
} from '@vulcan-sql/admin-ui/hooks/useExpressionFieldOptions';
import Link from 'next/link';

interface Props {
  model: string;
  visible: boolean;
  onSubmit: (values: any) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export default function AddCaculatedFieldModal(props: Props) {
  const { model, visible, loading, onSubmit, onClose } = props;
  const [form] = Form.useForm();
  const expression = Form.useWatch('expression', form);

  const modelFieldOptions = useModelFieldOptions();
  const expressionOptions = useExpressionFieldOptions();

  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit(values);
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
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
    >
      <div className="mb-4">
        Morem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
        libero et velit interdum, ac aliquet odio mattis.{' '}
        <Link href="" target="_blank" rel="noopener noreferrer">
          Learn more
        </Link>
      </div>

      <Form form={form} preserve={false} layout="vertical">
        <Form.Item
          label="Field name"
          name="fieldName"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_CACULATED_FIELD.FIELD_NAME.REQUIRED,
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
              message: ERROR_TEXTS.ADD_CACULATED_FIELD.EXPRESSION.REQUIRED,
            },
          ]}
        >
          <DescriptiveSelector
            placeholder="Select an expression"
            options={expressionOptions}
            descriptiveContentRender={(content) => {
              return (
                <>
                  <div className="mb-1">{content?.description || '-'}</div>
                  {content?.expression && (
                    <Typography.Text className="mb-1" code>
                      {content.expression}
                    </Typography.Text>
                  )}
                </>
              );
            }}
          />
        </Form.Item>
        <div className="py-1" />
        {expression === CUSTOM_EXPRESSION_VALUE ? (
          <Form.Item
            name="customExpression"
            rules={[
              {
                required: true,
                message: ERROR_TEXTS.ADD_CACULATED_FIELD.CUSTOM_FIELD.REQUIRED,
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        ) : (
          <Form.Item
            name="modelField"
            rules={[{ validator: modelFieldSelectorValidator }]}
          >
            <ModelFieldSelector model={model} options={modelFieldOptions} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
