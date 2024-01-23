import { Select } from 'antd';
import styled from 'styled-components';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { ModelIcon } from '@vulcan-sql/admin-ui/utils/icons';
import { IterableComponent } from '@vulcan-sql/admin-ui/utils/iteration';

const FieldBox = styled.div`
  border-radius: 4px;
  background-color: white;
  width: 170px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05),
    0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);

  + .adm-fieldBox {
    position: relative;
    margin-left: 40px;
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: -40px;
      width: 40px;
      height: 1px;
      background-color: var(--gray-8);
    }
  }

  .ant-select-selection-placeholder {
    color: var(--geekblue-6);
  }

  &:last-child {
    border: 1px var(--geekblue-6) solid;
  }
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px var(--gray-4) solid;
`;

const StyledSelect = styled(Select)`
  &.ant-select-status-error.ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
    .ant-select-selector {
    border-color: transparent !important;
  }
`;

export interface FieldOption {
  label: string | JSX.Element;
  value?: string;
  options?: FieldOption[];
}

export interface FieldValue {
  nodeType: NODE_TYPE;
  name: string;
  type?: string;
}

type Props = FieldValue & {
  options: FieldOption[];
  onChange?: (item: any, index: number) => void;
};

export default function FieldSelect(props: IterableComponent<Props>) {
  const { name, nodeType, options, onChange, data, index } = props;
  const currentIndex = data.findIndex((item) => item.name === name);
  const selectedField = data[currentIndex + 1];

  const selectedFieldValue = selectedField
    ? JSON.stringify(selectedField)
    : undefined;

  return nodeType === NODE_TYPE.MODEL ? (
    <FieldBox className="adm-fieldBox flex-shrink-0">
      <FieldHeader className="py-1 px-3">
        <ModelIcon className="mr-1 flex-shrink-0" />
        <div className="text-truncate flex-grow-1" title={name}>
          {name}
        </div>
        <div className="flex-shrink-0 cursor-pointer">+</div>
      </FieldHeader>

      {selectedField?.nodeType === NODE_TYPE.MODEL && (
        <div className="gray-7 text-sm px-3 pt-1">Relations</div>
      )}
      <StyledSelect
        bordered={false}
        options={options}
        placeholder="Select field"
        suffixIcon={null}
        value={selectedFieldValue}
        onSelect={(value) => {
          onChange && onChange(value, index);
        }}
      />
    </FieldBox>
  ) : null;
}
