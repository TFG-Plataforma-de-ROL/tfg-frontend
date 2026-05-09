import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { SistemaRol } from '../types';

export const sistemaRolService = {
  getAll: async (): Promise<SistemaRol[]> => {
    const res = await api.get(API_ENDPOINTS.SISTEMAS_ROL);
    return res.data;
  },

  getById: async (id: number): Promise<SistemaRol> => {
    const res = await api.get(API_ENDPOINTS.SISTEMA_ROL_BY_ID(id));
    return res.data;
  },
};
