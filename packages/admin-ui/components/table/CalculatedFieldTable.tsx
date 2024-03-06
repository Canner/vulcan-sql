import BaseTable, {
  Props,
  COLUMN,
} from '@vulcan-sql/admin-ui/components/table/BaseTable';

export default function CalculatedFieldTable(props: Props) {
  const { columns } = props;
  return (
    <BaseTable
      {...props}
      columns={
        columns || [
          COLUMN.DISPLAY_NAME,
          COLUMN.REFERENCE_NAME,
          COLUMN.EXPRESSION,
          COLUMN.DESCRIPTION,
        ]
      }
    />
  );
}
