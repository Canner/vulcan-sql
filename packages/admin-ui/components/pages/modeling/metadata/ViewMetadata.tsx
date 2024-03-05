import { Typography } from 'antd';
import FieldTable from '@vulcan-sql/admin-ui/components/table/FieldTable';
import { makeMetadataBaseTable } from '@vulcan-sql/admin-ui/components/table/MetadataBaseTable';
import UpdateMetadataModal from '@vulcan-sql/admin-ui/components/modals/UpdateMetadataModal';

export interface Props {
  fields: any[];
  properties: Record<string, any>
}

export default function ViewMetadata(props: Props) {
  const { fields = [], properties } = props || {};

  const FieldMetadataTable =
    makeMetadataBaseTable(FieldTable)(UpdateMetadataModal);

  // To convert edit value for update metadata modal
  const editMetadataValue = (value) => {
    return {
      displayName: value.displayName || value.name,
      description: value.description,
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
          Description
        </Typography.Text>
        <div>{properties?.description || '-'}</div>
      </div>

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
    </>
  );
}
