import api from './api'

export interface Campo {
  id_campo: number
  nombre_campo: string
  id_item_tipo: number | null
  id_plantilla: number
}

export interface Plantilla {
  id_plantilla: number
  nombre_plantilla: string
  id_sistema_rol: number | null
  version: string | null
  campos?: Campo[]
}

export const plantillaService = {
  getPlantillas: (id_sistema_rol?: number): Promise<Plantilla[]> =>
    api.get('/api/plantillas', { params: id_sistema_rol ? { id_sistema_rol } : undefined }).then((r) => r.data),

  getPlantillaById: (id: number): Promise<Plantilla> =>
    api.get(`/api/plantillas/${id}`).then((r) => r.data),

  createPlantilla: (data: { nombre_plantilla: string; id_sistema_rol?: number; version?: string }): Promise<Plantilla> =>
    api.post('/api/plantillas', data).then((r) => r.data),

  updatePlantilla: (id: number, data: { nombre_plantilla?: string; id_sistema_rol?: number; version?: string }): Promise<Plantilla> =>
    api.put(`/api/plantillas/${id}`, data).then((r) => r.data),

  deletePlantilla: (id: number): Promise<void> =>
    api.delete(`/api/plantillas/${id}`).then(() => undefined),

  createCampo: (plantillaId: number, data: { nombre_campo: string; id_item_tipo?: number }): Promise<Campo> =>
    api.post(`/api/plantillas/${plantillaId}/campos`, data).then((r) => r.data),

  updateCampo: (plantillaId: number, campoId: number, data: { nombre_campo?: string; id_item_tipo?: number }): Promise<void> =>
    api.put(`/api/plantillas/${plantillaId}/campos/${campoId}`, data).then(() => undefined),

  deleteCampo: (plantillaId: number, campoId: number): Promise<void> =>
    api.delete(`/api/plantillas/${plantillaId}/campos/${campoId}`).then(() => undefined),
}
