import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { FichaPlantilla } from '../types';

export const plantillaService = {
  getBySistema: async (id_sistema_rol: number): Promise<FichaPlantilla[]> => {
    const res = await api.get(API_ENDPOINTS.PLANTILLAS, { params: { id_sistema_rol } });
    return res.data;
  },
};
