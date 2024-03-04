import { Drawer, Button, Typography } from 'antd';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { DrawerAction } from '@vulcan-sql/admin-ui/hooks/useDrawerAction';
import { SparklesIcon } from '@vulcan-sql/admin-ui/utils/icons';
import ModelMetadata from './metadata/ModelMetadata';
import MetricMetadata from './metadata/MetricMetadata';
import ViewMetadata from './metadata/ViewMetadata';
import GenerateMetadataModal from './GenerateMetadataModal';
import useModalAction from '@vulcan-sql/admin-ui/hooks/useModalAction';

interface MetadataData {
  name: string;
  fields?: any[];
  calculatedFields?: any[];
  relations?: any[];
  measures?: any[];
  dimensions?: any[];
  windows?: any[];
  nodeType: NODE_TYPE;
  properties: Record<string, any>;
}

type Props = DrawerAction<MetadataData>;

export default function MetadataDrawer(props: Props) {
  const { visible, defaultValue, onClose } = props;
  const { name, properties, nodeType = NODE_TYPE.MODEL } = defaultValue || {};

  const generateMetadataModal = useModalAction();
  const openGeneratedMetadataModal = () => {
    generateMetadataModal.openModal(defaultValue);
  };

  const submitGenerateMetadata = async (values) => {
    console.log(values);
  };

  return (
    <Drawer
      visible={visible}
      title={name}
      width={750}
      closable
      destroyOnClose
      onClose={onClose}
      footer={
        <div className="text-right">
          <Button
            className="d-inline-flex align-center"
            icon={<SparklesIcon className="mr-2" />}
            onClick={openGeneratedMetadataModal}
          >
            Generate metadata
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Description
        </Typography.Text>
        <div>{properties?.description || '-'}</div>
      </div>

      {nodeType === NODE_TYPE.MODEL && <ModelMetadata {...defaultValue} />}
      {nodeType === NODE_TYPE.METRIC && <MetricMetadata {...defaultValue} />}
      {nodeType === NODE_TYPE.VIEW && <ViewMetadata {...defaultValue} />}

      <GenerateMetadataModal
        {...generateMetadataModal.state}
        onClose={generateMetadataModal.closeModal}
        onSubmit={submitGenerateMetadata}
      />
    </Drawer>
  );
}
