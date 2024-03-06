import { Modal, Form } from 'antd';
import { ModalAction } from '@vulcan-sql/admin-ui/hooks/useModalAction';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import GenerateModelMetadata, {
  Props as GenerateModelProps,
} from '@vulcan-sql/admin-ui/components/pages/modeling/metadata/GenerateModelMetadata';
import { EditableContext } from '@vulcan-sql/admin-ui/components/table/EditableBaseTable';

type Props = ModalAction<{
  name: string;
  nodeType: NODE_TYPE;
  referenceName: string;
  tableName: string;
  fields?: any[];
  calculatedFields?: any[];
  relations?: any[];
  measures?: any[];
  dimensions?: any[];
  windows?: any[];
  properties: Record<string, any>;
}> & { loading?: boolean };

export default function GenerateMetadataModal(props: Props) {
  const { visible, defaultValue, loading, onSubmit, onClose } = props;
  const { name } = defaultValue || {};

  const [form] = Form.useForm();

  const submit = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={`Generate ${name}'s metadata`}
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
