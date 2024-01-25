import { useState } from 'react';

export default function useModalAction() {
  const [visible, setVisible] = useState(false);

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  return {
    state: {
      visible,
    },
    openModal,
    closeModal,
  };
}
