import { useMemo } from 'react';
import { makeTableFormControl } from './base';
import AddCalculatedFieldModal, {
  CalculatedFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddCalculatedFieldModal';
import { getCalculatedFieldTableColumns } from '@vulcan-sql/admin-ui/components/table/CalculatedFieldTable';

export type CalculatedFieldTableValue = CalculatedFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddCalculatedFieldModal);

export default function CalculatedFieldTableFormControl(props: Props) {
  const columns = useMemo(getCalculatedFieldTableColumns, [props.value]);
  return <TableFormControl {...props} columns={columns} />;
}
