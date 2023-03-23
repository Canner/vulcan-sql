import { Parameter } from '@lib/__generated__/types';
import { Button, Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import styled from 'styled-components';

const StypeledParameterForm = styled.div`
  display: none;
  width: 335px;
  text-align: left;
  background: white;
  box-shadow: 0px 132px 53px rgba(0, 0, 0, 0.01),
    0px 74px 45px rgba(0, 0, 0, 0.05), 0px 33px 33px rgba(0, 0, 0, 0.09),
    0px 8px 18px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);

  &.isShow {
    display: block;
  }

  .parameterForm {
    &-formGroup {
      padding: 8px 16px;
    }
    &-btnGroup {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      border-top: 1px var(--gray-4) solid;
      > * + * {
        margin-left: 16px;
      }
    }
  }
`;

interface ParameterFormProps {
  className?: string;
  visible: boolean;
  loading: boolean;
  parameters: Parameter[];
  onReset: () => void;
  onSubmit: (values: any) => void;
}

export default function ParameterForm(props: ParameterFormProps) {
  const { className, visible, loading, parameters, onReset, onSubmit } = props;
  const [form] = useForm();
  const formItems = parameters.map((item) => {
    return (
      <Form.Item
        key={item.key}
        label={item.name}
        name={item.name}
        required={item.required}
        rules={[
          {
            required: item.required,
            message: 'Please input the required field.',
          },
        ]}
      >
        <Input />
      </Form.Item>
    );
  });

  const submit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <StypeledParameterForm
      className={`${className} ${visible ? 'isShow' : ''}`}
    >
      <Form form={form} layout="vertical">
        <div className="parameterForm-formGroup">{formItems}</div>
        <div className="parameterForm-btnGroup">
          <Button onClick={reset}>Reset</Button>
          <Button type="primary" onClick={submit} loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </StypeledParameterForm>
  );
}
