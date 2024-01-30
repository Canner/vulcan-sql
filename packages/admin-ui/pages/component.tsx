import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { Form, Button } from 'antd';
import { JOIN_TYPE, NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { useForm } from 'antd/lib/form/Form';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';
import useModelFieldOptions from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import AddCaculatedFieldModal from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';
import AddMeasureFieldModal from '@vulcan-sql/admin-ui/components/modals/AddMeasureFieldModal';
import AddDimensionFieldModal from '@vulcan-sql/admin-ui/components/modals/AddDimensionFieldModal';
import AddWindowFieldModal from '@vulcan-sql/admin-ui/components/modals/AddWindowFieldModal';
import AddRelationModal from '@vulcan-sql/admin-ui/components/modals/AddRelationModal';
import ModelDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/ModelDrawer';
import MetricDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetricDrawer';
import useDrawerAction from '@vulcan-sql/admin-ui/hooks/useDrawerAction';

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
  const addMeasureFieldModal = useModalAction();
  const addDimensionFieldModal = useModalAction();
  const addWindowFieldModal = useModalAction();
  const addRelationModal = useModalAction();

  const modelDrawer = useDrawerAction();
  const metricDrawer = useDrawerAction();

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

      <Button
        onClick={() =>
          addCaculatedFieldModal.openModal({
            fieldName: 'test',
            expression: 'Sum',
            modelFields: [
              { nodeType: NODE_TYPE.MODEL, name: 'Orders' },
              { nodeType: NODE_TYPE.FIELD, name: 'orders', type: 'Orders' },
            ],
            // expression: 'customExpression',
            // customExpression: 'test',
          })
        }
      >
        Add caculated field
      </Button>

      <Button onClick={() => addMeasureFieldModal.openModal()}>
        Add measure field
      </Button>

      <Button onClick={() => addDimensionFieldModal.openModal()}>
        Add dimesion field
      </Button>

      <Button onClick={() => addWindowFieldModal.openModal()}>
        Add window field
      </Button>

      <Button onClick={addRelationModal.openModal}>Add relation field</Button>

      <Button onClick={() => modelDrawer.openDrawer()}>Model drawer</Button>

      <Button onClick={() => metricDrawer.openDrawer()}>Metric drawer</Button>

      <AddCaculatedFieldModal
        model="Customer"
        {...addCaculatedFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addCaculatedFieldModal.closeModal}
        // defaultValue={{
        //   fieldName: 'test',
        //   expression: 'Sum',
        //   modelFields: [
        //     { nodeType: NODE_TYPE.MODEL, name: 'Orders' },
        //     { nodeType: NODE_TYPE.FIELD, name: 'orders', type: 'Orders' },
        //   ],
        //   // expression: 'customExpression',
        //   // customExpression: 'test',
        // }}
      />

      <AddMeasureFieldModal
        model="Customer"
        {...addMeasureFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addMeasureFieldModal.closeModal}
      />

      <AddDimensionFieldModal
        model="Customer"
        {...addDimensionFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addDimensionFieldModal.closeModal}
      />

      <AddWindowFieldModal
        model="Customer"
        {...addWindowFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addWindowFieldModal.closeModal}
      />

      <AddRelationModal
        model="Customer"
        {...addRelationModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addRelationModal.closeModal}
        defaultValue={{
          relationType: JOIN_TYPE.ONE_TO_ONE,
          fromField: {
            model: 'Customer',
            field: 'orders',
          },
          toField: {
            model: 'Lineitem',
            field: 'discount',
          },
          relationName: 'customer_orders',
          description: 'customer_orders_description',
        }}
      />

      <ModelDrawer
        {...modelDrawer.state}
        onClose={modelDrawer.closeDrawer}
        onSubmit={async (values) => {
          console.log(values);
        }}
        defaultValue={{
          modelName: 'Customer',
          description: 'customer_description',
          table: 'customer',
          fields: [
            {
              name: 'custKey',
              type: 'UUID',
            },
          ],
          caculatedFields: [
            {
              fieldName: 'test',
              expression: 'Sum',
              modelFields: [
                { nodeType: NODE_TYPE.MODEL, name: 'customer' },
                { nodeType: NODE_TYPE.FIELD, name: 'custKey', type: 'UUID' },
              ],
            },
          ],
          cached: true,
          cachedPeriod: '1m',
        }}
      />

      <MetricDrawer
        {...metricDrawer.state}
        onClose={metricDrawer.closeDrawer}
        onSubmit={async (values) => {
          console.log(values);
        }}
      />
    </Form>
  );
}
