import axios, { AxiosError } from 'axios';

export const postRequest = async (url: string, data: any, token: string) => {
  try {
    const result = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    // https://axios-http.com/docs/handling_errors
    // if response has error, throw the response error, or throw the request error
    if (axiosError.response)
      throw new Error(JSON.stringify(axiosError.response?.data));
    throw new Error(axiosError.message);
  }
};
