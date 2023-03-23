import { useRouter } from 'next/router';
import API, { axiosInstance } from './api';
import Path from './path';
import { useStore } from './store';

interface User {
  username: string;
}

const ACCESS_TOKEN_KEY = 'session';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface Auth {
  user: User | null;
  token: string | null;
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

export const useAuth = (): Auth => {
  const router = useRouter();
  const { user, setUser, token, setToken } = useStore();

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

      const response = await axiosInstance.get(API.Profile, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(response.data);
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

  return {
    token,
    user,
    login,
    logout,
    getProfile,
    syncStorageSession,
  };
};
