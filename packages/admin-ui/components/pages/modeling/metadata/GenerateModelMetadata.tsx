import { Typography, Row, Col } from 'antd';
import FieldTable from '@vulcan-sql/admin-ui/components/table/FieldTable';
import CalculatedFieldTable from '@vulcan-sql/admin-ui/components/table/CalculatedFieldTable';
import RelationTable from '@vulcan-sql/admin-ui/components/table/RelationTable';
import { makeEditableBaseTable } from '@vulcan-sql/admin-ui/components/table/EditableBaseTable';
import { COLUMN } from '@vulcan-sql/admin-ui/components/table/BaseTable';

export interface Props {
  referenceName: string;
  tableName: string;
  fields: any[];
  calculatedFields?: any[];
  relations: any[];
  properties: Record<string, any>;
}

export default function GenerateModelMetadata(props: Props) {
  const {
    fields = [],
    calculatedFields = [],
    relations = [],
    properties,
  } = props || {};

  const FieldEditableTable = makeEditableBaseTable(FieldTable);
  const CalculatedFieldEditableTable =
    makeEditableBaseTable(CalculatedFieldTable);
  const RelationEditableTable = makeEditableBaseTable(RelationTable);

  // To convert edit value for update metadata modal
  // const editMetadataValue = (value) => {
  //   return {
  //     displayName: value.displayName || value.name,
  //     description: value.properties?.description,
  //   };
  // };

  // const submitMetadata = (values) => {
  //   // TODO: waiting for API
  //   console.log(values);
  // };

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
              Description
            </Typography.Text>
            <div>{properties?.description || '-'}</div>
          </div>
        </Col>
      </Row>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Fields ({fields.length})
        </Typography.Text>
        <FieldEditableTable
          propertyName="fields"
          dataSource={fields}
          columns={[
            COLUMN.DISPLAY_NAME,
            COLUMN.REFERENCE_NAME,
            COLUMN.DESCRIPTION,
          ]}
        />
      </div>

      {!!calculatedFields.length && (
        <div className="mb-6">
          <Typography.Text className="d-block gray-7 mb-2">
            Calculated fields ({calculatedFields.length})
          </Typography.Text>
          <CalculatedFieldEditableTable
            propertyName="calculatedFields"
            dataSource={calculatedFields}
            columns={[
              COLUMN.DISPLAY_NAME,
              COLUMN.REFERENCE_NAME,
              COLUMN.DESCRIPTION,
            ]}
            // onEditValue={editMetadataValue}
            // onSubmitRemote={submitMetadata}
          />
        </div>
      )}

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Relations ({relations.length})
        </Typography.Text>
        <RelationEditableTable
          propertyName="relations"
          dataSource={relations}
          columns={[
            COLUMN.DISPLAY_NAME,
            COLUMN.REFERENCE_NAME,
            COLUMN.DESCRIPTION,
          ]}
          // onEditValue={editMetadataValue}
          // onSubmitRemote={submitMetadata}
        />
      </div>
    </>
  );
}
