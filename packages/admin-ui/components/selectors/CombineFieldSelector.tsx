import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';

const Wrapper = styled.div`
  .ant-select:first-child {
    width: 210px;
    .ant-select-selector {
      border-right: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  .ant-select:last-child .ant-select-selector {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

interface Value {
  model?: string;
  field?: string;
}

interface Props {
  modelOptions: { label: string; value: string }[];
  fieldOptions: { label: string; value: string }[];
  modelDisabled?: boolean;
  fieldDisabled?: boolean;
  modelValue?: string;
  fieldValue?: string;
  value?: Value;
  onModelChange?: (value: string) => void;
  onFieldChange?: (value: string) => void;
  onChange?: (value: Value) => void;
}

export default function CombineFieldSelector(props: Props) {
  const {
    modelValue,
    fieldValue,
    value = {},
    onModelChange,
    onFieldChange,
    onChange,
    modelOptions,
    fieldOptions,
    modelDisabled,
    fieldDisabled,
  } = props;

  const [internalValue, setInternalValue] = useState<Value>({
    model: modelValue,
    field: fieldValue,
    ...value,
  });

  const syncOnChange = () => {
    if (internalValue?.model && internalValue?.field) {
      onChange && onChange(internalValue);
    }
  };

  useEffect(syncOnChange, [internalValue]);

  const changeModel = async (model) => {
    onModelChange && onModelChange(model);
    setInternalValue({ ...internalValue, model });
  };

  const changeField = (field) => {
    onFieldChange && onFieldChange(field);
    setInternalValue({ ...internalValue, field });
  };

  return (
    <Wrapper className="d-flex">
      <Select
        options={modelOptions}
        onChange={changeModel}
        placeholder="Model"
        value={value?.model || modelValue}
        disabled={modelDisabled}
      />
      <Select
        options={fieldOptions}
        onChange={changeField}
        placeholder="Field"
        value={value?.field || fieldValue}
        disabled={fieldDisabled}
      />
    </Wrapper>
  );
}
