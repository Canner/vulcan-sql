import { Modal } from 'antd';
import { ModalAction } from '@vulcan-sql/admin-ui/hooks/useModalAction';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';

type Props = ModalAction<{
  name: string;
  fields?: any[];
  calculatedFields?: any[];
  relations?: any[];
  measures?: any[];
  dimensions?: any[];
  windows?: any[];
  nodeType: NODE_TYPE;
  properties: Record<string, any>;
}> & { loading?: boolean };

export default function GenerateMetadataModal(props: Props) {
  const { visible, defaultValue, loading, onSubmit, onClose } = props;
  const { name } = defaultValue;

  const submit = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={`Generate ${name}'s metadata`}
      width={520}
      visible={visible}
      okText="Submit"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
    ></Modal>
  );
}
