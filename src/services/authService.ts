import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { setToken } from '../utils/helpers';

export const authService = {
  /**
   * Login usuario
   */
  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (nombre: string, email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, {
      nombre,
      email,
      password,
    });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  /**
   * Logout usuario
   */
  logout: async () => {
    await api.post(API_ENDPOINTS.LOGOUT);
  },
};
