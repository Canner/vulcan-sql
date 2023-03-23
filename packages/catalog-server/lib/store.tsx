import { LoginModalProps } from '@components/LoginModal';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type LoginModal = Pick<LoginModalProps, 'visible' | 'canClose'>;

type User = {
  username: string;
};

interface Store {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
  pathNames: string[];
  setPathNames: Dispatch<SetStateAction<string[]>>;
  loginModal: LoginModal;
  setLoginModal: Dispatch<SetStateAction<LoginModal>>;
}

export const StoreContext = createContext<Store>(null);

export const useStore = () => {
  const Context = useContext(StoreContext);
  return Context;
};

const StoreProvider = (props: any) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [pathNames, setPathNames] = useState([]);
  const [loginModal, setLoginModal] = useState({
    visible: false,
    canClose: false,
  });

  const value = {
    user,
    setUser,
    token,
    setToken,
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
