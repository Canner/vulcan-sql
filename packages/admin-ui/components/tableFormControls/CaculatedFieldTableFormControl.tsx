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
          dataIndex: 'fieldName',
          width: 180,
        },
        {
          title: 'Expression',
          dataIndex: 'expression',
          render: (expression, record) => {
            // TODO: clarify the interface with backend
            const argumentFields = record.modelFields.map(
              (field) => field.name
            );
            const argumentTexts = argumentFields.join('.');
            return `${expression}${argumentTexts ? `(${argumentTexts})` : ''}`;
          },
        },
      ]}
    />
  );
}
