import { makeTableFormControl } from './base';
import AddWindowFieldModal, {
  WindowFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddWindowFieldModal';

export type WindowTableValue = WindowFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddWindowFieldModal);

export default function WindowTableFormControl(props: Props) {
  return (
    <TableFormControl
      {...props}
      columns={[
        {
          title: 'Name',
          dataIndex: 'fieldName',
        },
      ]}
    />
  );
}
