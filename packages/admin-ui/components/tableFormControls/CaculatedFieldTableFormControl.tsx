import { makeTableFormControl } from './base';
import AddCaculatedFieldModal, {
  CaculatedFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';

export type CaculatedFieldTableValue = CaculatedFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddCaculatedFieldModal);

export default function CaculatedFieldTableFormControl(props: Props) {
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
