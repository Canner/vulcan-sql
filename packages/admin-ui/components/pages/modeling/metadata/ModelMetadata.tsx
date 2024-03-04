import { Typography } from 'antd';
import FieldTable from '@vulcan-sql/admin-ui/components/table/FieldTable';
import CalculatedFieldTable from '@vulcan-sql/admin-ui/components/table/CalculatedFieldTable';
import RelationTableFormControl from '@vulcan-sql/admin-ui/components/tableFormControls/RelationTableFormControl';
import { makeMetadataBaseTable } from '@vulcan-sql/admin-ui/components/table/MetadataBaseTable';
import UpdateMetadataModal from '@vulcan-sql/admin-ui/components/modals/UpdateMetadataModal';

export default function ModelMetadata({
  name,
  fields = [],
  calculatedFields = [],
  relations = [],
}) {
  const FieldMetadataTable =
    makeMetadataBaseTable(FieldTable)(UpdateMetadataModal);
  const CalculatedFieldMetadataTable =
    makeMetadataBaseTable(CalculatedFieldTable)(UpdateMetadataModal);

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
        <RelationTableFormControl
          modalProps={{ model: name }}
          value={relations}
          onRemoteSubmit={submitRelation}
          onRemoteDelete={deleteRelation}
        />
      </div>
    </>
  );
}
