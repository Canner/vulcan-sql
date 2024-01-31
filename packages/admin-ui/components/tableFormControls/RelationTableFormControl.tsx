import { useMemo } from 'react';
import { makeTableFormControl } from './base';
import AddRelationModal, {
  RelationFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddRelationModal';
import { getRelationTableColumns } from '@vulcan-sql/admin-ui/components/table/RelationTable';
import { getMetadataColumns } from '@vulcan-sql/admin-ui/components/table/MetadataBaseTable';

export type RelationTableValue = RelationFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddRelationModal);

export default function RelationTableFormControl(props: Props) {
  const columns = useMemo(getRelationTableColumns, [props.value]);
  return (
    <TableFormControl
      {...props}
      // Relation has metadata directly in table form control
      columns={[...columns, ...getMetadataColumns()]}
    />
  );
}
