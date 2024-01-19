import dynamic from 'next/dynamic';
import { Form } from 'antd';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import useModelFieldOptions from '../hooks/useModelFieldOptions';

const ModelFieldSelector = dynamic(
  () => import('@vulcan-sql/admin-ui/components/modelFieldSelector'),
  { ssr: false }
);

const initialValue = [
  { nodeType: NODE_TYPE.MODEL, name: 'Orders' },
  { nodeType: NODE_TYPE.MODEL, name: 'Lineitem' },
  { nodeType: NODE_TYPE.FIELD, name: 'orders', type: 'Orders' },
];

export default function Test() {
  const [form] = useForm();

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
    </Form>
  );
}
