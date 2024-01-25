import { useMemo } from 'react';
import { Option } from '@vulcan-sql/admin-ui/components/selectors/DescriptiveSelector';

export const CUSTOM_EXPRESSION_VALUE = 'customExpression';

export default function useExpressionFieldOptions() {
  const expressionOptions = useMemo(() => {
    return [
      {
        label: 'Aggregation',
        options: [
          {
            label: 'Sum',
            value: 'sum',
            content: {
              title: 'Sum(column)',
              description: 'Adds up all the value of the column.',
              expression: 'Sum ( [order.price] )',
            },
          },
          {
            label: 'Average',
            value: 'average',
            content: {
              title: 'Average(column)',
              description: 'Adds up all the value of the column.',
              expression: 'Average ( [order.price] )',
            },
          },
        ],
      },
      {
        label: 'Custom',
        options: [
          {
            label: 'Custom expression',
            value: CUSTOM_EXPRESSION_VALUE,
          },
        ],
      },
    ] as Option[];
  }, []);

  return expressionOptions;
}
