import type { LoginModalProps } from '@vulcan-sql/catalog-server/components/LoginModal';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type LoginModal = Pick<LoginModalProps, 'visible' | 'canClose' | 'hasError'>;

interface Store {
  pathNames: string[];
  setPathNames: Dispatch<SetStateAction<string[]>>;
  loginModal: LoginModal;
  setLoginModal: Dispatch<SetStateAction<LoginModal>>;
}

export const StoreContext = createContext<Store>(null);

export const useStore = () => {
  return useContext(StoreContext);
};

const StoreProvider = (props: any) => {
  const [pathNames, setPathNames] = useState([]);
  const [loginModal, setLoginModal] = useState({
    visible: false,
    canClose: false,
    hasError: false,
  });

  const value = {
    pathNames,
    setPathNames,
    loginModal,
    setLoginModal,
  };

  return (
    <StoreContext.Provider value={value}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
