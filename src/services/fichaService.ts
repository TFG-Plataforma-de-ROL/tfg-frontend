import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { FichaPersonaje } from '../types';

export const fichaService = {
  getAll: async (personajeId: number): Promise<FichaPersonaje[]> => {
    const res = await api.get(API_ENDPOINTS.FICHAS(personajeId));
    return res.data;
  },

  create: async (personajeId: number, data: { nombre: string; id_sistema_rol?: number }): Promise<FichaPersonaje> => {
    const res = await api.post(API_ENDPOINTS.FICHAS(personajeId), data);
    return res.data;
  },
};
