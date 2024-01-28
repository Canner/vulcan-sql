import { useMemo } from 'react';
import { SQLEditorAutoCompleteSourceWordInfo } from '@vulcan-sql/admin-ui/components/editor';

interface Props {
  selectedTable?: string;
}

const checkSqlName = (name: string) => {
  return name.match(/^\d+/g) === null ? name : `"${name}"`;
};

export default function useModelDetailFormOptions(props: Props) {
  const { selectedTable } = props;
  const response = [
    {
      name: 'customer',
      columns: [{ name: 'custKey', type: 'UUID' }],
    },
  ];

  const dataSourceTableOptions = useMemo(() => {
    return response.map((item) => ({
      label: item.name,
      value: item.name,
    }));
  }, [response]);

  const dataSourceTableColumnOptions = useMemo(() => {
    const table = response.find((table) => table.name === selectedTable);
    return (table?.columns || []).map((column) => ({
      label: column.name,
      value: { name: column.name, type: column.type },
    }));
  }, [selectedTable]);

  const autoCompleteSource: SQLEditorAutoCompleteSourceWordInfo[] =
    useMemo(() => {
      return response.reduce((result, item) => {
        result.push({
          caption: item.name,
          value: checkSqlName(item.name),
          meta: 'Table',
        });
        item.columns &&
          item.columns.forEach((column) => {
            result.push({
              caption: `${item.name}.${column.name}`,
              value: checkSqlName(column.name),
              meta: `Column(${column.type})`,
            });
          });
        return result;
      }, []);
    }, [response]);

  return {
    dataSourceTableOptions,
    dataSourceTableColumnOptions,
    autoCompleteSource,
  };
}
