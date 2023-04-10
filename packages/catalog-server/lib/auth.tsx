import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import API, { axiosInstance } from './api';
import type { UserProfile } from '@vulcan-sql/catalog-server/utils/authHelper';
import Path from './path';

const ACCESS_TOKEN_KEY = 'session';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface Auth {
  user: UserProfile;
  token: string;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: (callback?: any) => Promise<void>;
  syncStorageSession: (event: StorageEvent) => void;
}

const AuthContext = createContext<Auth>(null);

export const useAuth = (): Auth => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const clearLoginInfo = () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const response = await axiosInstance.post(API.Login, {
      username,
      password,
    });

    const { profile, accessToken, refreshToken } = response.data;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setToken(accessToken);
    setUser(profile);
  };

  const logout = async () => {
    await axiosInstance.get(API.Logout, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    clearLoginInfo();
  };

  // check if user is logged in
  const getProfile = async (options) => {
    try {
      const accessToken =
        window.localStorage.getItem(ACCESS_TOKEN_KEY) || token;
      setToken(accessToken);

      const { data } = await axiosInstance.get(API.Profile, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(data.profile);

      // go to home page if auth is disabled
      if (data.profile === null) {
        if (router.pathname === Path.Login) {
          router.push(Path.Home);
        }
      }
    } catch (e) {
      clearLoginInfo();
      options.redirectTo && router.push(options.redirectTo);
    }
  };

  const syncStorageSession = (event: StorageEvent): void => {
    if (event.key === ACCESS_TOKEN_KEY) {
      setToken(event.newValue);
    }
  };

  const auth = {
    user,
    token,
    login,
    logout,
    getProfile,
    syncStorageSession,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
