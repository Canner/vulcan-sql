import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Menu, Modal, Input, Row, Col } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { ModalAction } from '@vulcan-sql/admin-ui/hooks/useModalAction';
import { compact } from 'lodash';
import {
  MetricIcon,
  ModelIcon,
  ViewIcon,
} from '@vulcan-sql/admin-ui/utils/icons';

const StyledMenu = styled(Menu)`
  border-right: none;

  .ant-menu-item-group-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--gray-8);
    padding: 8px 8px 0;
  }

  .ant-menu-item {
    padding: 0;
    margin: 4px 0 !important;
    padding-left: 8px !important;
    height: 32px;
    line-height: 32px;
    background: transparent;
    color: var(--gray-9) !important;
    border-radius: 4px;

    &:hover {
      background: var(--gray-2);
    }

    &.ant-menu-item-selected {
      background: var(--gray-3);
      border-radius: 4px;

      &:after {
        display: none;
      }
    }
  }
`;

const MENU = {
  MODEL: 'Models',
  METRIC: 'Metrics',
  VIEW: 'Views',
};

const MENU_GROUPS = {
  [MENU.MODEL]: {
    label: 'Models',
    type: 'group',
  },
  [MENU.METRIC]: {
    label: 'Metrics',
    type: 'group',
  },
  [MENU.VIEW]: {
    label: 'Views',
    type: 'group',
  },
};

type Props = ModalAction & {
  loading?: boolean;
};

export default function SelectDataToExploreModal(props: Props) {
  const { visible, loading, onClose, defaultValue } = props;
  const [searchValue, setSearchValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // TODO: Replace with real data
  const models = [
    { id: '1', name: 'Orders' },
    { id: '2', name: 'Orders2' },
    { id: '3', name: 'Orders3' },
  ];

  const metrics = [
    { id: 'o1', name: 'Test1' },
    { id: 'o2', name: 'Test2' },
    { id: 'o3', name: 'Test3' },
    { id: 'o4', name: 'Test4' },
    { id: 'o5', name: 'Test5' },
    { id: 'o6', name: 'Test6' },
  ];

  const views = [
    { id: 'c1', name: 'Test1' },
    { id: 'c2', name: 'Test2' },
    { id: 'c3', name: 'Test3' },
    { id: 'c4', name: 'Test4' },
    { id: 'c5', name: 'Test5' },
    { id: 'c6', name: 'Test6' },
  ];

  const goToExplore = () => {
    onClose();
  };

  const search = (event) => {
    const value = event.target.value;
    setSearchValue(value.trim());
  };

  const clickMenu = useCallback(
    (item: ItemType) => {
      console.log(item);
      const [type, id] = (item.key as string).split('_');
      if (type === MENU.MODEL) {
        setSelectedItem(models.find((model) => model.id === id));
      } else if (type === MENU.METRIC) {
        setSelectedItem(metrics.find((metric) => metric.id === id));
      } else if (type === MENU.VIEW) {
        setSelectedItem(views.find((view) => view.id === id));
      }
    },
    [models, metrics, views]
  );

  const reset = () => {
    setSearchValue('');
    setSelectedItem(null);
  };

  const menu = useMemo(() => {
    const getGroupItems = (group: Record<string, any>, items: any[]) => {
      return items.length ? { ...group, children: items } : undefined;
    };
    const filterSearch = (item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase());

    const getLabel = (label: string, Icon) => {
      let nextLabel: any = label;
      if (searchValue) {
        const regex = new RegExp(searchValue, 'gi');
        const splitedLabel = label.split(regex);

        const matchTexts = label.match(regex);
        const restructure = matchTexts
          ? matchTexts.reduce((result, text, index) => {
              return (
                result +
                splitedLabel.shift() +
                `<span class="red-5">${text}</span>` +
                // the last part of the label
                (index === matchTexts.length - 1 ? splitedLabel.pop() : '')
              );
            }, '')
          : label;

        nextLabel = <span dangerouslySetInnerHTML={{ __html: restructure }} />;
      }

      return (
        <div className="d-flex align-center">
          <Icon className="mr-2" />
          {nextLabel}
        </div>
      );
    };

    const modelItems = models.filter(filterSearch).map((model) => ({
      label: getLabel(model.name, ModelIcon),
      key: `${MENU.MODEL}_${model.id}`,
    }));

    const metricItems = metrics.filter(filterSearch).map((metric) => ({
      label: getLabel(metric.name, MetricIcon),
      key: `${MENU.METRIC}_${metric.id}`,
    }));

    const viewItems = views.filter(filterSearch).map((view) => ({
      label: getLabel(view.name, ViewIcon),
      key: `${MENU.VIEW}_${view.id}`,
    }));

    const result = compact([
      getGroupItems(MENU_GROUPS[MENU.MODEL], modelItems),
      getGroupItems(MENU_GROUPS[MENU.METRIC], metricItems),
      getGroupItems(MENU_GROUPS[MENU.VIEW], viewItems),
    ]) as ItemType[];

    return result;
  }, [models, metrics, views, searchValue]);

  return (
    <Modal
      bodyStyle={{ padding: 0 }}
      width={960}
      visible={visible}
      okText="Explore"
      onOk={goToExplore}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      closable={false}
      destroyOnClose
      afterClose={() => reset()}
    >
      <Row wrap={false} style={{ height: '70vh' }}>
        <Col
          span={7}
          className="p-3 d-flex flex-column"
          style={{
            borderRight: '1px var(--gray-4) solid',
            height: '100%',
          }}
        >
          <Input
            prefix={<SearchOutlined className="gray-6" />}
            placeholder="Search"
            onInput={search}
          />
          <div className="mt-3" style={{ overflowY: 'auto' }}>
            <StyledMenu mode="inline" items={menu} onClick={clickMenu} />
          </div>
        </Col>
        <Col span={17} className="d-flex flex-column">
          {selectedItem ? (
            <>
              <h4
                className="px-3 py-2"
                style={{ borderBottom: '1px var(--gray-4) solid' }}
              >
                {selectedItem.name}
              </h4>
              <div className="p-3" style={{ overflowY: 'auto' }}>
                <p>Selected data will be used to explore</p>
              </div>
            </>
          ) : (
            <div
              className="d-flex align-center justify-center"
              style={{ height: '100%' }}
            >
              No data selected
            </div>
          )}
        </Col>
      </Row>
    </Modal>
  );
}
