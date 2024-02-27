import styled from 'styled-components';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  List,
  Menu,
  Space,
} from 'antd';

const DropdownMenu = styled(Menu)`
  .ant-dropdown-menu-item {
    cursor: auto;
  }
`;

const OptionCard = styled(Card)`
  width: 150px;

  &.ant-card-small {
    > .ant-card-body {
      padding: 4px;
    }
  }

  .ant-card-actions > li {
    margin: 8px 0px;
  }

  .ant-checkbox-wrapper {
    width: 100%;
    > span:not(.ant-checkbox) {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
`;

export interface FilterOption {
  [key: string]: any;
  key: string;
  title: string;
}

export enum OPTION_MODE {
  MULTIPLE = 'MULTIPLE',
  SINGLE = 'SINGLE',
}

interface Props {
  colorClass: string;
  disabled: boolean;
  onChange: (value: FilterOption[] | string[]) => void;
  onCloseChange: () => void;
  onOpenChange: (visible: boolean) => void;
  onReset: () => void;
  optionMode: OPTION_MODE;
  options: FilterOption[];
  title: string;
  value: FilterOption[] | string[];
  visible: boolean;
}

export default function FilterDropdown(props: Props) {
  const {
    colorClass,
    disabled,
    onChange,
    onCloseChange,
    onOpenChange,
    onReset,
    optionMode,
    options,
    title,
    value,
    visible,
  } = props;

  const onOptionChange = (event, fieldId: string) => {
    const { target } = event;
    onChange(
      target.checked
        ? ([...value, fieldId] as string[])
        : (value as string[]).filter((valueItems) => valueItems !== fieldId)
    );
  };

  const menuProps =
    optionMode === OPTION_MODE.SINGLE
      ? {
          items: options,
          onClick: ({ key }) => {
            const selectedItem = options.find((option) => option.key === key);
            onChange([...(value as FilterOption[]), selectedItem]);
            onCloseChange();
          },
        }
      : {
          selectable: false,
          style: { padding: 0 },
          items: [
            {
              label: (
                <OptionCard
                  actions={[
                    <div
                      className="d-flex align-center justify-space-between"
                      key="actions"
                    >
                      <Button
                        key="reset"
                        type="link"
                        onClick={onReset}
                        size="small"
                      >
                        Reset
                      </Button>
                    </div>,
                  ]}
                  bordered={false}
                  size="small"
                >
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                    <List
                      size="small"
                      dataSource={options}
                      renderItem={(item) => (
                        <List.Item
                          style={{ padding: '4px 0', margin: 0, border: 0 }}
                          title={item.title}
                        >
                          <Checkbox
                            key={item.key}
                            checked={value.includes(item.id)}
                            onChange={(event) => onOptionChange(event, item.id)}
                          >
                            {item.title}
                          </Checkbox>
                        </List.Item>
                      )}
                    />
                  </div>
                </OptionCard>
              ),
              key: 'filter-option-card',
              style: { backgroundColor: 'transparent' },
            },
          ],
        };

  return (
    <Dropdown
      disabled={disabled}
      onVisibleChange={onOpenChange}
      overlay={<DropdownMenu {...menuProps} />}
      trigger={['click']}
      visible={visible}
    >
      <Button
        className={`${colorClass} ${
          value.length > 0 ? `${colorClass}-count` : ''
        }`}
      >
        <Space size={[4, 0]}>
          {title}
          <Badge count={value.length} size="small" />
        </Space>
      </Button>
    </Dropdown>
  );
}
