import { useContext, useEffect, useState } from 'react';
import { Typography, Row, Col } from 'antd';
import FieldTable from '@vulcan-sql/admin-ui/components/table/FieldTable';
import CalculatedFieldTable from '@vulcan-sql/admin-ui/components/table/CalculatedFieldTable';
import RelationTable from '@vulcan-sql/admin-ui/components/table/RelationTable';
import { makeEditableBaseTable } from '@vulcan-sql/admin-ui/components/table/EditableBaseTable';
import { COLUMN } from '@vulcan-sql/admin-ui/components/table/BaseTable';
import { cloneDeep, set } from 'lodash';
import EditableWrapper, {
  EditableContext,
} from '@vulcan-sql/admin-ui/components/EditableWrapper';

export interface Props {
  displayName: string;
  fields: any[];
  calculatedFields?: any[];
  relations: any[];
  properties: Record<string, any>;
  onChange?: (value: any) => void;
}

export const namespace = 'generatedMetadata';

const BasicMetadata = (props) => {
  const { dataSource, onChange } = props;
  const [data, setData] = useState(dataSource);

  useEffect(() => {
    onChange && onChange(data);
  }, [data]);

  const handleSave = (_, value) => {
    const [dataIndexKey] = Object.keys(value);

    const newData = cloneDeep(data);
    set(newData, dataIndexKey, value[dataIndexKey]);
    setData(newData);
  };

  return (
    <Row>
      <Col span={12}>
        <div className="mb-6">
          <Typography.Text className="d-block gray-7 mb-2">
            Display name
          </Typography.Text>
          <EditableWrapper
            record={data}
            dataIndex="displayName"
            handleSave={handleSave}
          >
            {data.displayName || '-'}
          </EditableWrapper>
        </div>
      </Col>
      <Col span={12}>
        <div className="mb-6">
          <Typography.Text className="d-block gray-7 mb-2">
            Description
          </Typography.Text>
          <EditableWrapper
            record={data}
            dataIndex="properties.description"
            handleSave={handleSave}
          >
            {data.properties?.description || '-'}
          </EditableWrapper>
        </div>
      </Col>
    </Row>
  );
};

export default function GenerateModelMetadata(props: Props) {
  const {
    displayName,
    fields = [],
    calculatedFields = [],
    relations = [],
    properties,
  } = props || {};

  const FieldEditableTable = makeEditableBaseTable(FieldTable);
  const CalculatedFieldEditableTable =
    makeEditableBaseTable(CalculatedFieldTable);
  const RelationEditableTable = makeEditableBaseTable(RelationTable);

  const form = useContext(EditableContext);

  const onChange = (value) => {
    form.setFieldsValue({
      generatedMetadata: {
        ...(form.getFieldValue(namespace) || {}),
        ...value,
      },
    });
  };

  return (
    <>
      <BasicMetadata
        dataSource={{ displayName, properties }}
        onChange={onChange}
      />

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Fields ({fields.length})
        </Typography.Text>
        <FieldEditableTable
          dataSource={fields}
          columns={[
            COLUMN.REFERENCE_NAME,
            COLUMN.DISPLAY_NAME,
            COLUMN.DESCRIPTION,
          ]}
          onChange={(value) => onChange({ fields: value })}
        />
      </div>

      {!!calculatedFields.length && (
        <div className="mb-6">
          <Typography.Text className="d-block gray-7 mb-2">
            Calculated fields ({calculatedFields.length})
          </Typography.Text>
          <CalculatedFieldEditableTable
            dataSource={calculatedFields}
            columns={[
              COLUMN.REFERENCE_NAME,
              COLUMN.DISPLAY_NAME,
              COLUMN.DESCRIPTION,
            ]}
            onChange={(value) => onChange({ calculatedFields: value })}
          />
        </div>
      )}

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Relations ({relations.length})
        </Typography.Text>
        <RelationEditableTable
          dataSource={relations}
          columns={[
            COLUMN.REFERENCE_NAME,
            COLUMN.DISPLAY_NAME,
            COLUMN.DESCRIPTION,
          ]}
          onChange={(value) => onChange({ relations: value })}
        />
      </div>
    </>
  );
}
