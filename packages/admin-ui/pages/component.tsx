import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { Form, Button } from 'antd';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { useForm } from 'antd/lib/form/Form';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';
import useModelFieldOptions from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import AddCaculatedFieldModal from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';

const ModelFieldSelector = dynamic(
  () => import('@vulcan-sql/admin-ui/components/selectors/modelFieldSelector'),
  { ssr: false }
);

const initialValue = [
  { nodeType: NODE_TYPE.MODEL, name: 'Orders' },
  { nodeType: NODE_TYPE.MODEL, name: 'Lineitem' },
  { nodeType: NODE_TYPE.FIELD, name: 'orders', type: 'Orders' },
];

export default function Component() {
  const [form] = useForm();

  const addCaculatedFieldModal = useModalAction();

  const fieldOptions = useModelFieldOptions();
  const modelFields = Form.useWatch('modelFields', form);

  useEffect(() => {
    console.log('modelFields', modelFields);
  }, [modelFields]);

  return (
    <Form form={form} className="p-10">
      <Form.Item name="modelFields" initialValue={initialValue}>
        <ModelFieldSelector model="customer" options={fieldOptions} />
      </Form.Item>

      <div>
        value:
        <pre>
          <code>{JSON.stringify(modelFields, undefined, 2)}</code>
        </pre>
      </div>

      <Button onClick={addCaculatedFieldModal.openModal}>
        Add caculated field
      </Button>

      <AddCaculatedFieldModal
        model="Customer"
        {...addCaculatedFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addCaculatedFieldModal.closeModal}
        defaultValue={{
          fieldName: 'test',
          expression: 'Sum',
          modelField: [
            { nodeType: NODE_TYPE.MODEL, name: 'Orders' },
            { nodeType: NODE_TYPE.FIELD, name: 'orders', type: 'Orders' },
          ],
          // expression: 'customExpression',
          // customExpression: 'test',
        }}
      />
    </Form>
  );
}
