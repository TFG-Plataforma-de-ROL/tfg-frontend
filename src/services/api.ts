import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/helpers';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
