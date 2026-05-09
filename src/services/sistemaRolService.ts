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

  create: async (data: { nombre: string; descripcion?: string; nivel_maximo?: number }): Promise<SistemaRol> => {
    const res = await api.post(API_ENDPOINTS.SISTEMAS_ROL, data);
    return res.data;
  },

  update: async (id: number, data: { nombre?: string; descripcion?: string; nivel_maximo?: number }): Promise<SistemaRol> => {
    const res = await api.put(API_ENDPOINTS.SISTEMA_ROL_BY_ID(id), data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.SISTEMA_ROL_BY_ID(id));
  },
};
