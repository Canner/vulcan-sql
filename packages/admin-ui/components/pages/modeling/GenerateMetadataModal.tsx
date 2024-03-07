import { Modal, Form } from 'antd';
import { ModalAction } from '@vulcan-sql/admin-ui/hooks/useModalAction';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import GenerateModelMetadata, {
  Props as GenerateModelProps,
  namespace,
} from '@vulcan-sql/admin-ui/components/pages/modeling/metadata/GenerateModelMetadata';
import { EditableContext } from '@vulcan-sql/admin-ui/components/EditableWrapper';

type Props = ModalAction<{
  nodeType: NODE_TYPE;
  displayName: string;
  referenceName: string;
  fields?: any[];
  calculatedFields?: any[];
  relations?: any[];
  properties: Record<string, any>;
}> & { loading?: boolean };

export default function GenerateMetadataModal(props: Props) {
  const { visible, defaultValue, loading, onSubmit, onClose } = props;
  const { displayName } = defaultValue || {};

  const [form] = Form.useForm();

  const submit = async () => {
    const values = form.getFieldValue(namespace);
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      title={`Generate ${displayName}'s metadata`}
      width={700}
      visible={visible}
      okText="Submit"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
    >
      <EditableContext.Provider value={form}>
        <Form form={form} component={false}>
          <GenerateModelMetadata {...(defaultValue as GenerateModelProps)} />
        </Form>
      </EditableContext.Provider>
    </Modal>
  );
}
