import { useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { isEmpty } from 'lodash';
import { ERROR_TEXTS } from '@vulcan-sql/admin-ui/utils/error';
import CombineFieldSelector from '@vulcan-sql/admin-ui/components/selectors/CombineFieldSelector';
import { JOIN_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { getJoinTypeText } from '@vulcan-sql/admin-ui/utils/data';
import useCombineFieldOptions from '@vulcan-sql/admin-ui/hooks/useCombineFieldOptions';
import { RelationsDataType } from '@vulcan-sql/admin-ui/components/table/SelectionRelationTable';

export type RelationFieldValue = { [key: string]: any } & Pick<
  RelationsDataType,
  'relationType' | 'fromField' | 'toField' | 'relationName'
> & {
    description?: string;
  };

interface Props {
  model: string;
  visible: boolean;
  onSubmit: (values: RelationsDataType) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  defaultValue?: RelationFieldValue;
  allowSetDescription?: boolean;
}

function RelationModal(props: Props) {
  const {
    allowSetDescription = true,
    defaultValue,
    loading,
    model,
    onClose,
    onSubmit,
    visible,
  } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(defaultValue || {});
  }, [form, defaultValue]);

  const relationTypeOptions = Object.keys(JOIN_TYPE).map((key) => ({
    label: getJoinTypeText(key),
    value: JOIN_TYPE[key],
  }));

  const fromCombineField = useCombineFieldOptions({ model });
  const toCombineField = useCombineFieldOptions({
    model: defaultValue?.toField.model,
    excludeModels: [model],
  });

  const submit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit({ ...defaultValue, ...values });
        onClose();
      })
      .catch(console.error);
  };

  return (
    <Modal
      title={`${isEmpty(defaultValue) ? 'Add' : 'Update'} relation`}
      width={750}
      visible={visible}
      okText="Submit"
      onOk={submit}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnClose
      afterClose={() => form.resetFields()}
    >
      <Form form={form} preserve={false} layout="vertical">
        <Form.Item
          label="Name"
          name="relationName"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_RELATION.NAME.REQUIRED,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="From field"
              name="fromField"
              required
              rules={[
                {
                  required: true,
                  message: ERROR_TEXTS.ADD_RELATION.FROM_FIELD.REQUIRED,
                },
              ]}
            >
              <CombineFieldSelector
                modelValue={model}
                modelDisabled={true}
                onModelChange={fromCombineField.onModelChange}
                modelOptions={fromCombineField.modelOptions}
                fieldOptions={fromCombineField.fieldOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="To field"
              name="toField"
              required
              rules={[
                {
                  required: true,
                  message: ERROR_TEXTS.ADD_RELATION.TO_FIELD.REQUIRED,
                },
              ]}
            >
              <CombineFieldSelector
                onModelChange={toCombineField.onModelChange}
                modelOptions={toCombineField.modelOptions}
                fieldOptions={toCombineField.fieldOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Relation type"
          name="relationType"
          required
          rules={[
            {
              required: true,
              message: ERROR_TEXTS.ADD_RELATION.RELATION_TYPE.REQUIRED,
            },
          ]}
        >
          <Select
            options={relationTypeOptions}
            placeholder="Select a relation type"
          />
        </Form.Item>
        {allowSetDescription && (
          <Form.Item label="Description" name="description">
            <Input.TextArea showCount maxLength={300} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default function AddRelationModal(props: Props) {
  if (!props.visible) return null;

  return <RelationModal {...props} />;
}
