import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { compactObject } from '@vulcan-sql/admin-ui/utils/helper';
import { getNodeTypeIcon } from '@vulcan-sql/admin-ui/utils/nodeType';

interface SelectValue {
  nodeType: NODE_TYPE;
  name: string;
  type?: string;
}

export default function useModelFieldOptions() {
  const response = [
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

  const currentModel = response.shift();

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
      value: JSON.stringify(value),
    };
  };

  const columns = currentModel.columns.map(convertor);
  const relations = [{ label: 'Relations', options: response.map(convertor) }];

  return [columns, relations].flat();
}
