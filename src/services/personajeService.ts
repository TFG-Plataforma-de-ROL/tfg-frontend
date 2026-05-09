import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { Personaje } from '../types';

export const personajeService = {
  getAll: async (): Promise<Personaje[]> => {
    const res = await api.get(API_ENDPOINTS.PERSONAJES);
    return res.data;
  },

  getById: async (id: number): Promise<Personaje> => {
    const res = await api.get(API_ENDPOINTS.PERSONAJE_BY_ID(id));
    return res.data;
  },

  create: async (data: { nombre: string; id_sistema_rol: number; descripcion?: string }): Promise<Personaje> => {
    const res = await api.post(API_ENDPOINTS.PERSONAJES, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.PERSONAJE_BY_ID(id));
  },
};
