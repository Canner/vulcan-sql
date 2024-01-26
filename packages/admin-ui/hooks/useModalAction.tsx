import { useState } from 'react';

export default function useModalAction() {
  const [visible, setVisible] = useState(false);
  const [defaultValue, setDefaultValue] = useState(null);

  const openModal = (value?: any) => {
    value && setDefaultValue(value);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setDefaultValue(null);
  };

  return {
    state: {
      visible,
      defaultValue,
    },
    openModal,
    closeModal,
  };
}
