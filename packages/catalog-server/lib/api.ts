import axios from 'axios';
import { errorCode } from '@vulcan-sql/catalog-server/utils/errorCode';

enum API {
  Login = '/api/auth/login',
  Logout = '/api/auth/logout',
  Profile = '/api/auth/profile',
}

export default API;

const handleError = ({ statusCode, errorMessage }) => {
  const errorCodeMap = {
    [errorCode.UNAUTHORIZED_REQUEST.status]() {
      localStorage.clear();
    },
    default() {
      //
    },
  };
  return (errorCodeMap[statusCode] || errorCodeMap['default'])();
};

export const axiosInstance = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4200',
  responseType: 'json',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { message } = error;
    const { status: statusCode } = error.response;
    const { code } = error.response?.data ?? '';
    console.error(
      `${code} ${error.config.baseURL}${error.config.url} ${message}`
    );
    if (code) handleError({ statusCode, errorMessage: message });
    return Promise.reject(error);
  }
);
