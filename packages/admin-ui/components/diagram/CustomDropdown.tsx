import { Dropdown, Menu } from 'antd';

interface Props {
  onMoreClick: (type: 'edit' | 'delete') => void;
  children: React.ReactNode;
}

export default function CustomDropdown(props: Props) {
  const { onMoreClick, children } = props;
  return (
    <Dropdown
      trigger={['click']}
      overlayStyle={{ minWidth: 100 }}
      overlay={
        <Menu
          onClick={(e) => e.domEvent.stopPropagation()}
          items={[
            {
              label: 'Edit',
              key: 'edit',
              onClick: () => onMoreClick('edit'),
            },
            {
              label: 'Delete',
              className: 'red-5',
              key: 'delete',
              onClick: () => onMoreClick('delete'),
            },
          ]}
        />
      }
    >
      {children}
    </Dropdown>
  );
}
