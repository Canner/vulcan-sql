import { useMemo } from 'react';
import { makeTableFormControl } from './base';
import AddCaculatedFieldModal, {
  CaculatedFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddCaculatedFieldModal';
import { getCaculatedFieldTableColumns } from '@vulcan-sql/admin-ui/components/table/CaculatedFieldTable';

export type CaculatedFieldTableValue = CaculatedFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddCaculatedFieldModal);

export default function CaculatedFieldTableFormControl(props: Props) {
  const columns = useMemo(getCaculatedFieldTableColumns, [props.value]);
  return <TableFormControl {...props} columns={columns} />;
}
