import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { CampoValor } from '../types';

export const campoValorService = {
  getAll: async (personajeId: number, fichaId: number): Promise<CampoValor[]> => {
    const res = await api.get(API_ENDPOINTS.VALORES(personajeId, fichaId));
    return res.data;
  },

  create: async (
    personajeId: number,
    fichaId: number,
    data: {
      id_campo_plantilla: number;
      id_item_valor?: number | null;
      valor_texto?: string | null;
      valor_numero?: number | null;
    }
  ): Promise<CampoValor> => {
    const res = await api.post(API_ENDPOINTS.VALORES(personajeId, fichaId), data);
    return res.data;
  },

  update: async (
    personajeId: number,
    fichaId: number,
    valorId: number,
    data: {
      id_item_valor?: number | null;
      valor_texto?: string | null;
      valor_numero?: number | null;
    }
  ): Promise<void> => {
    await api.put(API_ENDPOINTS.VALOR_BY_ID(personajeId, fichaId, valorId), data);
  },

  delete: async (personajeId: number, fichaId: number, valorId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.VALOR_BY_ID(personajeId, fichaId, valorId));
  },
};
