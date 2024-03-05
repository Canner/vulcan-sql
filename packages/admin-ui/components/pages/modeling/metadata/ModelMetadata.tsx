import { Typography, Row, Col } from 'antd';
import FieldTable from '@vulcan-sql/admin-ui/components/table/FieldTable';
import CalculatedFieldTable from '@vulcan-sql/admin-ui/components/table/CalculatedFieldTable';
import RelationTable from '@vulcan-sql/admin-ui/components/table/RelationTable';
import { makeMetadataBaseTable } from '@vulcan-sql/admin-ui/components/table/MetadataBaseTable';
import UpdateMetadataModal from '@vulcan-sql/admin-ui/components/modals/UpdateMetadataModal';

export interface Props {
  referenceName: string;
  tableName: string;
  fields: any[];
  calculatedFields: any[];
  relations: any[];
  properties: Record<string, any>;
}

export default function ModelMetadata(props: Props) {
  const {
    tableName,
    referenceName,
    fields = [],
    calculatedFields = [],
    relations = [],
    properties,
  } = props || {};

  const FieldMetadataTable =
    makeMetadataBaseTable(FieldTable)(UpdateMetadataModal);
  const CalculatedFieldMetadataTable =
    makeMetadataBaseTable(CalculatedFieldTable)(UpdateMetadataModal);
  const RelationMetadataTable =
    makeMetadataBaseTable(RelationTable)(UpdateMetadataModal);

  const submitRelation = async (value) => {
    // TODO: waiting for API
    console.log(value);
  };

  const deleteRelation = async (value) => {
    // TODO: waiting for API
    console.log(value);
  };

  // To convert edit value for update metadata modal
  const editMetadataValue = (value) => {
    return {
      displayName: value.displayName || value.name,
      description: value.properties?.description,
    };
  };

  const submitMetadata = (values) => {
    // TODO: waiting for API
    console.log(values);
  };

  return (
    <>
      <Row>
        <Col span={12}>
          <div className="mb-6">
            <Typography.Text className="d-block gray-7 mb-2">
              Display name
            </Typography.Text>
            <div>{properties?.displayName || '-'}</div>
          </div>
        </Col>
        <Col span={12}>
          <div className="mb-6">
            <Typography.Text className="d-block gray-7 mb-2">
              Reference name
            </Typography.Text>
            <div>{referenceName || '-'}</div>
          </div>
        </Col>
        <Col span={24}>
          <div className="mb-6">
            <Typography.Text className="d-block gray-7 mb-2">
              Description
            </Typography.Text>
            <div>{properties?.description || '-'}</div>
          </div>
        </Col>
        <Col span={12}>
          <div className="mb-6">
            <Typography.Text className="d-block gray-7 mb-2">
              Source table name
            </Typography.Text>
            <div>{tableName || '-'}</div>
          </div>
        </Col>
      </Row>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Fields ({fields.length})
        </Typography.Text>
        <FieldMetadataTable
          dataSource={fields}
          onEditValue={editMetadataValue}
          onSubmitRemote={submitMetadata}
        />
      </div>

      {!!calculatedFields.length && (
        <div className="mb-6">
          <Typography.Text className="d-block gray-7 mb-2">
            Calculated fields ({calculatedFields.length})
          </Typography.Text>
          <CalculatedFieldMetadataTable
            dataSource={calculatedFields}
            onEditValue={editMetadataValue}
            onSubmitRemote={submitMetadata}
          />
        </div>
      )}

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Relations ({relations.length})
        </Typography.Text>
        <RelationMetadataTable
          dataSource={relations}
          onEditValue={editMetadataValue}
          onSubmitRemote={submitMetadata}
        />
      </div>
    </>
  );
}
