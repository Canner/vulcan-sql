import { useEffect } from 'react';
import { Modal, Form, Input, Typography } from 'antd';
import FunctionOutlined from '@ant-design/icons/FunctionOutlined';
import ModelFieldSelector from '@vulcan-sql/admin-ui/components/selectors/modelFieldSelector';
import { FieldValue } from '@vulcan-sql/admin-ui/components/selectors/modelFieldSelector/FieldSelect';
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
  defaultValue?: {
    [key: string]: any;
    fieldName: string;
    expression: string;
    modelField?: FieldValue[];
    customExpression?: string;
  };
}

export default function AddCaculatedFieldModal(props: Props) {
  const { model, visible, loading, onSubmit, onClose, defaultValue } = props;
  const [form] = Form.useForm();
  const expression = Form.useWatch('expression', form);

  useEffect(() => {
    form.setFieldsValue(defaultValue || {});
  }, [defaultValue]);

  const modelFieldOptions = useModelFieldOptions();
  const expressionOptions = useExpressionFieldOptions();

  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit({ ...defaultValue, ...values });
        onClose();
      })
      .catch(console.error);
  };

  return (
    <Modal
      title="Add caculated field"
      width={750}
      visible={visible}
      okText="Submit"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
      afterClose={() => form.resetFields()}
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
        <ExpressionArgument
          model={model}
          modelFieldOptions={modelFieldOptions}
          expression={expression}
        />
      </Form>
    </Modal>
  );
}

const ExpressionArgument = ({ expression, modelFieldOptions, model }) => {
  if (!expression) return null;

  return expression === CUSTOM_EXPRESSION_VALUE ? (
    <div className="bg-gray-2 px-10 py-4">
      <Form.Item
        label="Expression"
        required
        name="customExpression"
        rules={[
          {
            required: true,
            message: ERROR_TEXTS.ADD_CACULATED_FIELD.CUSTOM_FIELD.REQUIRED,
          },
        ]}
      >
        <Input addonBefore={<FunctionOutlined />} />
      </Form.Item>
    </div>
  ) : (
    <Form.Item
      name="modelField"
      rules={[
        {
          validator: modelFieldSelectorValidator(
            ERROR_TEXTS.ADD_CACULATED_FIELD.MODEL_FIELD
          ),
        },
      ]}
    >
      <ModelFieldSelector model={model} options={modelFieldOptions} />
    </Form.Item>
  );
};
