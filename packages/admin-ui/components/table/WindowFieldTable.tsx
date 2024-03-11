// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-nocheck */
// This file just remain for future scope.
import BaseTable, {
  Props,
  COLUMN,
} from '@vulcan-sql/admin-ui/components/table/BaseTable';

export default function WindowFieldTable(props: Props) {
  const { columns } = props;
  return (
    <BaseTable
      {...props}
      columns={
        columns || [
          COLUMN.DISPLAY_NAME,
          COLUMN.REFERENCE_NAME,
          COLUMN.DESCRIPTION,
        ]
      }
    />
  );
}
