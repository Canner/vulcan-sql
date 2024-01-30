import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { FieldValue } from '@vulcan-sql/admin-ui/components/selectors/modelFieldSelector/FieldSelect';
import { ModelFieldResposeData } from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';
import ExpressionProperties from '@vulcan-sql/admin-ui/components/form/ExpressionProperties';
import Link from 'next/link';

export type MeasureFieldValue = {
  [key: string]: any;
  fieldName: string;
  expression: string;
  modelFields?: FieldValue[];
  customExpression?: string;
};

interface Props {
  model: string;
  visible: boolean;
  onSubmit: (values: any) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  defaultValue?: MeasureFieldValue;

  // The transientData is used to get the model fields which are not created in DB yet.
  transientData?: ModelFieldResposeData[];
}

export default function AddMeasureFieldModal(props: Props) {
  const {
    model,
    transientData,
    visible,
    loading,
    onSubmit,
    onClose,
    defaultValue,
  } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(defaultValue || {});
  }, [form, defaultValue]);

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
      title="Add measure"
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
          label="Measure name"
          name="fieldName"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_MEASURE_FIELD.FIELD_NAME.REQUIRED,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <ExpressionProperties
          form={form}
          model={model}
          transientData={transientData}
        />
      </Form>
    </Modal>
  );
}
