import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { FichaPlantilla, CampoPlantilla } from '../types';

export const plantillaService = {
  // --- FichaPlantilla ---

  getAll: async (id_sistema_rol?: number): Promise<FichaPlantilla[]> => {
    const res = await api.get(API_ENDPOINTS.PLANTILLAS, { params: id_sistema_rol ? { id_sistema_rol } : undefined });
    return res.data;
  },

  getBySistema: async (id_sistema_rol: number): Promise<FichaPlantilla[]> => {
    const res = await api.get(API_ENDPOINTS.PLANTILLAS, { params: { id_sistema_rol } });
    return res.data;
  },

  getById: async (id: number): Promise<FichaPlantilla> => {
    const res = await api.get(API_ENDPOINTS.PLANTILLA_BY_ID(id));
    return res.data;
  },

  create: async (data: { nombre_plantilla: string; id_sistema_rol?: number; version?: number }): Promise<FichaPlantilla> => {
    const res = await api.post(API_ENDPOINTS.PLANTILLAS, data);
    return res.data;
  },

  update: async (id: number, data: { nombre_plantilla?: string; id_sistema_rol?: number; version?: number }): Promise<FichaPlantilla> => {
    const res = await api.put(API_ENDPOINTS.PLANTILLA_BY_ID(id), data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.PLANTILLA_BY_ID(id));
  },

  // --- CampoPlantilla ---

  createCampo: async (
    plantillaId: number,
    data: { nombre_campo: string; nivel_disponible?: number; tipo_campo?: string; filtro_item?: string }
  ): Promise<CampoPlantilla> => {
    const res = await api.post(API_ENDPOINTS.CAMPOS(plantillaId), data);
    return res.data;
  },

  updateCampo: async (
    plantillaId: number,
    campoId: number,
    data: { nombre_campo?: string; nivel_disponible?: number; tipo_campo?: string; filtro_item?: string }
  ): Promise<void> => {
    await api.put(API_ENDPOINTS.CAMPO_BY_ID(plantillaId, campoId), data);
  },

  deleteCampo: async (plantillaId: number, campoId: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CAMPO_BY_ID(plantillaId, campoId));
  },
};
