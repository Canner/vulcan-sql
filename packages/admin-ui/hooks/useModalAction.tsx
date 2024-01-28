import { useState } from 'react';
import { FORM_MODE } from '@vulcan-sql/admin-ui/utils/enum';

export default function useModalAction() {
  const [visible, setVisible] = useState(false);
  const [formMode, setFormMode] = useState(FORM_MODE.CREATE);
  const [defaultValue, setDefaultValue] = useState(null);

  const openModal = (value?: any) => {
    value && setDefaultValue(value);
    value && setFormMode(FORM_MODE.EDIT);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setDefaultValue(null);
    setFormMode(FORM_MODE.CREATE);
  };

  return {
    state: {
      visible,
      formMode,
      defaultValue,
    },
    openModal,
    closeModal,
  };
}
