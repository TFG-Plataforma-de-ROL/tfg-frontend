import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { Item } from '../types';

export const itemService = {
  getAll: async (): Promise<Item[]> => {
    const res = await api.get(API_ENDPOINTS.ITEMS);
    return res.data;
  },

  getFiltered: async (params: { id_sistema_rol?: number; tipo_item?: string }): Promise<Item[]> => {
    const res = await api.get(API_ENDPOINTS.ITEMS, { params });
    return res.data;
  },

  create: async (data: { nombre: string; tipo_item: string; id_sistema_rol?: number; todos_datos?: Record<string, unknown> }): Promise<Item> => {
    const res = await api.post(API_ENDPOINTS.ITEMS, data);
    return res.data;
  },

  update: async (id: number, data: { nombre?: string; tipo_item?: string; id_sistema_rol?: number; todos_datos?: Record<string, unknown> }): Promise<Item> => {
    const res = await api.put(API_ENDPOINTS.ITEM_BY_ID(id), data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.ITEM_BY_ID(id));
  },
};
