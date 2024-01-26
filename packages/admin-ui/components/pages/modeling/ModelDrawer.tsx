import React, { useState } from 'react';
import { Drawer, Form, FormInstance } from 'antd';
import { MODEL_STEP } from '@vulcan-sql/admin-ui/utils/enum';
import ModelBasicForm, {
  ButtonGroup as ModelBasicButtonGroup,
  ButtonProps as ModelBasicButtonProps,
} from './form/ModelBasicForm';
import ModelDetailForm, {
  ButtonGroup as ModelDetailButtonGroup,
  ButtonProps as ModelDetailButtonProps,
} from './form/ModelDetailForm';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  defaultValue?: any;
}

const DynamicForm = (props: { step: MODEL_STEP; form: FormInstance }) => {
  return (
    {
      [MODEL_STEP.ONE]: <ModelBasicForm {...props} />,
      [MODEL_STEP.TWO]: <ModelDetailForm {...props} />,
    }[props.step] || null
  );
};

const DynamicButtonGroup = (
  props: { step: MODEL_STEP } & ModelBasicButtonProps & ModelDetailButtonProps
) => {
  return (
    {
      [MODEL_STEP.ONE]: <ModelBasicButtonGroup {...props} />,
      [MODEL_STEP.TWO]: <ModelDetailButtonGroup {...props} />,
    }[props.step] || null
  );
};

export default function CreateModelDrawer(props: Props) {
  const { visible, defaultValue, onClose, onSubmit } = props;
  const [internalValues, setInternalValues] = useState(defaultValue || null);
  const [step, setStep] = useState(MODEL_STEP.ONE);
  const [form] = Form.useForm();

  const afterVisibleChange = (visible: boolean) => {
    if (visible) {
      form.setFieldsValue(defaultValue || {});
    } else {
      setStep(MODEL_STEP.ONE);
      form.resetFields();
      setInternalValues(null);
    }
  };

  const preview = () => {
    form
      .validateFields()
      .then((values) => {
        console.log({ ...internalValues, ...values });
      })
      .catch(console.error);
  };

  const back = () => {
    setStep(MODEL_STEP.ONE);
  };

  const next = () => {
    form
      .validateFields()
      .then((values) => {
        setInternalValues({ ...internalValues, ...values });
        setStep(MODEL_STEP.TWO);
      })
      .catch(console.error);
  };

  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit({ ...internalValues, ...values });
        onClose();
      })
      .catch(console.error);
  };

  return (
    <Drawer
      visible={visible}
      title={defaultValue ? 'Update a model' : 'Create a model'}
      width={750}
      closable
      destroyOnClose
      afterVisibleChange={afterVisibleChange}
      onClose={onClose}
      footer={
        <DynamicButtonGroup
          step={step}
          onCancel={onClose}
          onBack={back}
          onNext={next}
          onSubmit={submit}
          onPreview={preview}
        />
      }
      extra={<>Step {step}/2</>}
    >
      <DynamicForm step={step} form={form} />
    </Drawer>
  );
}
