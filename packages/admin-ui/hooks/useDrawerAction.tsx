import { useState } from 'react';

export default function useDrawerAction() {
  const [visible, setVisible] = useState(false);
  const [defaultValue, setDefaultValue] = useState(null);

  const openDrawer = (value?: any) => {
    value && setDefaultValue(value);
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
    setDefaultValue(null);
  };

  return {
    state: {
      visible,
      defaultValue,
    },
    openDrawer,
    closeDrawer,
  };
}
