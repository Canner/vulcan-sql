import { makeTableFormControl } from './base';
import AddMeasureFieldModal, {
  MeasureFieldValue,
} from '@vulcan-sql/admin-ui/components/modals/AddMeasureFieldModal';

export type MeasureTableValue = MeasureFieldValue[];

type Props = Omit<React.ComponentProps<typeof TableFormControl>, 'columns'>;

const TableFormControl = makeTableFormControl(AddMeasureFieldModal);

export default function MeasureTableFormControl(props: Props) {
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
