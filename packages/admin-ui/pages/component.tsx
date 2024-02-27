import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Form, Badge, Button, Select, Space, Tag } from 'antd';
import { JOIN_TYPE, NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { useForm } from 'antd/lib/form/Form';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';
import useModelFieldOptions from '@vulcan-sql/admin-ui/hooks/useModelFieldOptions';
import AddCalculatedFieldModal from '@vulcan-sql/admin-ui/components/modals/AddCalculatedFieldModal';
import AddMeasureFieldModal from '@vulcan-sql/admin-ui/components/modals/AddMeasureFieldModal';
import AddDimensionFieldModal from '@vulcan-sql/admin-ui/components/modals/AddDimensionFieldModal';
import AddWindowFieldModal from '@vulcan-sql/admin-ui/components/modals/AddWindowFieldModal';
import AddRelationModal from '@vulcan-sql/admin-ui/components/modals/AddRelationModal';
import ModelDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/ModelDrawer';
import MetricDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetricDrawer';
import MetadataDrawer from '@vulcan-sql/admin-ui/components/pages/modeling/MetadataDrawer';
import SelectDataToExploreModal from '@vulcan-sql/admin-ui/components/pages/explore/SelectDataToExploreModal';
import useDrawerAction from '@vulcan-sql/admin-ui/hooks/useDrawerAction';
import ExplorationFiltersBlock, {
  ECPLORATION_RESOURCE_TYPE,
} from '@vulcan-sql/admin-ui/components/dropdown/ExplorationFiltersBlock';
import { adapter, Manifest } from '@vulcan-sql/admin-ui/utils/data';
import { useManifestQuery } from '@vulcan-sql/admin-ui/apollo/client/graphql/manifest.generated';

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
  const { data } = useManifestQuery();

  const adaptedManifest = useMemo(() => {
    if (!data) return null;
    return adapter(data?.manifest as Manifest);
  }, [data]);

  const addCalculatedFieldModal = useModalAction();
  const addMeasureFieldModal = useModalAction();
  const addDimensionFieldModal = useModalAction();
  const addWindowFieldModal = useModalAction();
  const addRelationModal = useModalAction();
  const selectDataToExploreModal = useModalAction();

  const modelDrawer = useDrawerAction();
  const metricDrawer = useDrawerAction();
  const metadataDrawer = useDrawerAction();

  const fieldOptions = useModelFieldOptions();
  const modelFields = Form.useWatch('modelFields', form);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedResourceOptions, setSelectedResourceOptions] = useState();
  const [selectedResourceFilters, setSelectedResourceFilters] = useState();

  useEffect(() => {
    console.log('modelFields', modelFields);
  }, [modelFields]);

  const { models = [], metrics = [] } = adaptedManifest || {};
  console.log('adaptedManifest', adaptedManifest);

  const onFiltersChange = (filterType, filterValue) => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: filterValue }));
  };

  console.log('\n Selected Filters:', selectedFilters);

  const onResourceChange = (value) => {
    setSelectedResourceOptions(value);
    const data = [...models, ...metrics].find((x) => x.name === value);
    setSelectedResourceFilters({
      data,
      selectedType:
        data.nodeType === 'model'
          ? ECPLORATION_RESOURCE_TYPE.MODEL
          : ECPLORATION_RESOURCE_TYPE.METRIC,
    });
  };
  const selectOptions = [...models, ...metrics].map((x) => ({
    value: x.name,
    label: x.name,
  }));

  return (
    <>
      <Form form={form} className="p-10">
        <Form.Item name="modelFields" initialValue={initialValue}>
          <ModelFieldSelector model="customer" options={fieldOptions} />
        </Form.Item>
      </Form>
      <div>
        value:
        <pre>
          <code>{JSON.stringify(modelFields, undefined, 2)}</code>
        </pre>
      </div>

      <Button
        onClick={() =>
          addCalculatedFieldModal.openModal({
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
        Add calculated field
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

      <Button onClick={() => metadataDrawer.openDrawer()}>
        Metadata drawer
      </Button>

      <Button onClick={() => selectDataToExploreModal.openModal()}>
        Select data to explore
      </Button>

      <AddCalculatedFieldModal
        model="Customer"
        {...addCalculatedFieldModal.state}
        onSubmit={async (values) => {
          console.log(values);
        }}
        onClose={addCalculatedFieldModal.closeModal}
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
          joinType: JOIN_TYPE.ONE_TO_ONE,
          fromField: {
            model: 'Customer',
            field: 'orders',
          },
          toField: {
            model: 'Lineitem',
            field: 'discount',
          },
          name: 'customer_orders',
          properties: {
            description: 'customer_orders_description',
          },
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
          calculatedFields: [
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

      <MetadataDrawer
        {...metadataDrawer.state}
        onClose={metadataDrawer.closeDrawer}
        onSubmit={async (values) => {
          console.log(values);
        }}
        // defaultValue={{
        //   name: 'Customer',
        //   nodeType: NODE_TYPE.MODEL,
        //   description: 'customer_description',
        //   fields: [
        //     {
        //       name: 'custKey',
        //       type: 'UUID',
        //     },
        //   ],
        //   calculatedFields: [
        //     {
        //       fieldName: 'test',
        //       expression: 'Sum',
        //       modelFields: [
        //         { nodeType: NODE_TYPE.MODEL, name: 'customer' },
        //         { nodeType: NODE_TYPE.FIELD, name: 'custKey', type: 'UUID' },
        //       ],
        //     },
        //   ],
        //   relations: [],
        // }}
        defaultValue={{
          name: 'Metric',
          nodeType: NODE_TYPE.METRIC,
          measures: [
            {
              fieldName: 'test',
              expression: 'Sum',
              modelFields: [
                { nodeType: NODE_TYPE.MODEL, name: 'customer' },
                { nodeType: NODE_TYPE.FIELD, name: 'custKey', type: 'UUID' },
              ],
            },
          ],
          dimensions: [
            {
              fieldName: 'test',
              expression: 'Sum',
              modelFields: [
                { nodeType: NODE_TYPE.MODEL, name: 'customer' },
                { nodeType: NODE_TYPE.FIELD, name: 'custKey', type: 'UUID' },
              ],
            },
          ],
          properties: {
            description: 'metric description',
          },
        }}
      />

      <SelectDataToExploreModal
        {...selectDataToExploreModal.state}
        onClose={selectDataToExploreModal.closeModal}
      />

      <Space size={[4, 16]} className="mx-1 my-4">
        <Button>Basic default button</Button>
        <Button className={'adm-btn-green adm-btn-green-count'} disabled>
          <Space size={[4, 0]}>
            Test (disabled)
            <Badge count={2} size="small" />
          </Space>
        </Button>
        <Button className="adm-btn-green adm-btn-green-count">
          <Space size={[4, 0]}>
            Fields
            <Badge count={3} size="small" />
          </Space>
        </Button>
        <Button className="adm-btn-citrus">
          <Space size={[4, 0]}>
            Calculated Fields
            <Badge count={0} size="small" />
          </Space>
        </Button>
        <Button className="adm-btn-purple adm-btn-purple-count">
          <Space size={[4, 0]}>
            Filters
            <Badge count={5} size="small" />
          </Space>
        </Button>
      </Space>
      <div className="mt-2">
        <Tag className="adm-tag-purple">Purple</Tag>
        <Tag
          className="adm-tag-purple text-truncate"
          style={{ width: 350 }}
          title="(TBD measure 建立說明) Morem ipsum dolor sit amet, consectetur
      adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet
      odio mattis. Learn more"
        >
          (TBD measure 建立說明) Morem ipsum dolor sit amet, consectetur
          adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet
          odio mattis. Learn more
        </Tag>
      </div>
      <div className="mt-2">
        <Select
          defaultValue={selectedResourceOptions}
          style={{ width: 300, marginRight: 8 }}
          onChange={onResourceChange}
          options={selectOptions}
        />
        {selectedResourceFilters && (
          <ExplorationFiltersBlock
            data={selectedResourceFilters.data}
            selectedType={selectedResourceFilters.selectedType}
            onFiltersChange={onFiltersChange}
          />
        )}
      </div>
    </>
  );
}
