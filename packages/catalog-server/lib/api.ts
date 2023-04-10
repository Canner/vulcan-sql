import axios from 'axios';

enum API {
  Login = '/api/auth/login',
  Logout = '/api/auth/logout',
  Profile = '/api/auth/profile',
}

export default API;

const handleError = ({ errorCode, errorMessage }) => {
  const errorCodeMap = {
    Unauthorized() {
      localStorage.clear();
      window.location.href = '/';
    },
    default() {
      const event = new CustomEvent('apiErr', {
        detail: { errorMessage },
      });
      window.dispatchEvent(event);
    },
  };
  return (errorCodeMap[errorCode] || errorCodeMap['default'])();
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
    const { code: errorCode, message } = error;
    const { code } = error?.response?.data ?? '';
    console.error(
      `${code} ${error.config.baseURL}${error.config.url} ${message}`
    );

    handleError({ errorCode, errorMessage: message });
    return Promise.reject(error);
  }
);
