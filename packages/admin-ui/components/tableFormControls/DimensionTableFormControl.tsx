import { makeTableFormControl } from './base';
import AddDimensionFieldModal, {
  DimensionFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddDimensionFieldModal';

export type DimensionTableValue = DimensionFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddDimensionFieldModal);

export default function DimensionTableFormControl(props: Props) {
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
