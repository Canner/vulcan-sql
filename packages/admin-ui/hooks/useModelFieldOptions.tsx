import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { compactObject } from '@vulcan-sql/admin-ui/utils/helper';
import { getNodeTypeIcon } from '@vulcan-sql/admin-ui/utils/nodeType';

interface SelectValue {
  nodeType: NODE_TYPE;
  name: string;
  type?: string;
}

export interface ModelFieldResposeData {
  name: string;
  columns: {
    name: string;
    properties: {
      type: string;
    };
  }[];
}

export default function useModelFieldOptions(
  transientData?: ModelFieldResposeData[]
) {
  const response = transientData
    ? transientData
    : [
        {
          name: 'Customer',
          columns: [
            {
              name: 'orders',
              properties: { type: 'Orders' },
            },
          ],
        },
        {
          name: 'Orders',
          columns: [
            {
              name: 'lineitem',
              properties: { type: 'Lineitem' },
            },
          ],
        },
        {
          name: 'Lineitem',
          columns: [
            {
              name: 'extendedprice',
              properties: { type: 'REAL' },
            },
            {
              name: 'discount',
              properties: { type: 'REAL' },
            },
          ],
        },
      ];

  const currentModel = response[0];
  const lineage = response.slice(1, response.length);

  if (currentModel === undefined) return [];

  const convertor = (item: any) => {
    const isModel = !!item.columns;
    const nodeType = isModel ? NODE_TYPE.MODEL : NODE_TYPE.FIELD;
    const columnType = item.properties?.type;
    const value: SelectValue = compactObject({
      nodeType,
      name: item.name,
      type: columnType,
    });

    return {
      label: (
        <div className="d-flex align-center">
          {getNodeTypeIcon(
            { nodeType, type: columnType },
            { className: 'mr-1' }
          )}
          {item.name}
        </div>
      ),
      value,
    };
  };

  const columns = currentModel.columns.map(convertor) || [];
  const relations = lineage.length
    ? [{ label: 'Relations', options: lineage.map(convertor) }]
    : [];

  return [columns, relations].flat();
}
