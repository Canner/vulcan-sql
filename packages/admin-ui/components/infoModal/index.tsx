import { Fragment, memo, useMemo, useState } from 'react';
import { MetricData, ModelData, NODE_TYPE } from '@vulcan-sql/admin-ui/utils/data/model';
import { Button, Modal, ModalProps } from 'antd';
import ModelInfo from './ModelInfo';
import MetricInfo from './MetricInfo';

interface Props<T> extends ModalProps {
  data?: T;
}

export const InfoModal = (props: Props<ModelData & MetricData>) => {
  const { data, onOk, ...restProps } = props;
  const DynamicComponent = useMemo(
    () =>
      ({
        [NODE_TYPE.MODEL]: ModelInfo,
        [NODE_TYPE.METRIC]: MetricInfo,
      }[data?.nodeType] || Fragment),
    [data?.nodeType]
  );
  return (
    <Modal
      width={893}
      {...restProps}
      footer={
        <Button type="primary" onClick={onOk}>
          OK
        </Button>
      }
    >
      {data && <DynamicComponent data={data} />}
    </Modal>
  );
};

export default memo(InfoModal);

export const useInfoModal = () => {
  const [infoModalProps, setInfoModalProps] = useState({
    title: '',
    data: undefined,
    visible: false,
  });
  const openInfoModal = (nextProps) => {
    setInfoModalProps({ ...infoModalProps, ...nextProps, visible: true });
  };
  const closeInfoModal = () => {
    setInfoModalProps({ ...infoModalProps, visible: false });
  };
  return { infoModalProps, openInfoModal, closeInfoModal };
};
