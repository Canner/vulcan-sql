import React from 'react';
import { DatePicker, Form, Input, InputNumber, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import {
  space,
  SpaceProps,
  layout,
  LayoutProps,
  border,
  BorderProps,
} from 'styled-system';
import { isEmpty } from 'lodash';
import Button from '@/components/Button';

const FooterContent = styled.div<LayoutProps & BorderProps & SpaceProps>`
  ${layout}
  ${border}
  ${space}
`;

const StyledButton = styled(Button)<SpaceProps>`
  ${space}
`;

export interface Props {
  parameters: ParameterProps[];
  onSubmit: (data: object) => Promise<void>;
}

export interface ParameterProps {
  name: string;
  key: string;
  type: ParameterTypeProps;
  required: boolean;
}

export enum ParameterTypeProps {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Number = 'NUMBER',
  String = 'STRING',
}

const ParametersForm = ({ parameters, onSubmit }: Props) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const parameterInput = (type) => {
    switch (type) {
      case ParameterTypeProps.Boolean:
        return (
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
        );

      case ParameterTypeProps.String:
        return <Input />;

      case ParameterTypeProps.Number:
        return <InputNumber />;

      case ParameterTypeProps.Date:
        return <DatePicker />;

      case ParameterTypeProps.Datetime:
        return <DatePicker showTime />;

      default:
        return <Input />;
    }
  };

  const parametersInput = parameters.map(({ name, key, type, required }) => (
    <Form.Item
      name={name}
      label={key}
      key={key}
      rules={[{ required: required }]}
    >
      {parameterInput(type)}
    </Form.Item>
  ));

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      {isEmpty(parameters) ? 'No Parameters' : parametersInput}
      <Form.Item
        style={{
          margin: '0',
        }}
      >
        <FooterContent
          display="flex"
          borderTop={1}
          borderTopColor="borderColor1"
          borderTopStyle="solid"
          pt={1}
        >
          <StyledButton
            htmlType="button"
            onClick={onReset}
            mr={1}
            ml="auto"
            disabled={isEmpty(parameters)}
          >
            Reset
          </StyledButton>
          <StyledButton
            variant="primary"
            htmlType="submit"
            disabled={isEmpty(parameters)}
          >
            Submit
          </StyledButton>
        </FooterContent>
      </Form.Item>
    </Form>
  );
};

export default ParametersForm;
