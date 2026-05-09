import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { Item } from '../types';

export const itemService = {
  getFiltered: async (params: { id_sistema_rol?: number; tipo_item?: string }): Promise<Item[]> => {
    const res = await api.get(API_ENDPOINTS.ITEMS, { params });
    return res.data;
  },
};
