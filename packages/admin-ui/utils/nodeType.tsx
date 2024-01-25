import { getColumnTypeIcon } from './columnType';
import { COLUMN_TYPE, NODE_TYPE } from './enum';
import { MetricIcon, ModelIcon, RelationshipIcon } from './icons';

export const getNodeTypeIcon = (
  payload: { nodeType: NODE_TYPE | string; type?: COLUMN_TYPE | string },
  attrs?: any
) => {
  const { nodeType, type } = payload;
  switch (nodeType) {
    case NODE_TYPE.MODEL:
      return <ModelIcon {...attrs} />;
    case NODE_TYPE.METRIC:
      return <MetricIcon {...attrs} />;
    case NODE_TYPE.RELATION:
      return <RelationshipIcon {...attrs} />;

    case NODE_TYPE.FIELD:
      return type ? getColumnTypeIcon({ type }, attrs) : null;

    default:
      return null;
  }
};
