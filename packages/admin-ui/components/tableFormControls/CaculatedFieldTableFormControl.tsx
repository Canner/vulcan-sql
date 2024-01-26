import { makeTableFormControl } from './base';
import AddCaculatedFieldModal from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';

const TableFormControl = makeTableFormControl(AddCaculatedFieldModal);

export default function CaculatedFieldTableFormControl(
  props: React.ComponentProps<typeof TableFormControl>
) {
  return (
    <TableFormControl
      {...props}
      columns={[
        {
          title: 'Name',
          key: 'name',
          dataIndex: 'fieldName',
        },
        {
          title: 'Expression',
          key: 'expression',
          dataIndex: 'expression',
        },
      ]}
    />
  );
}
