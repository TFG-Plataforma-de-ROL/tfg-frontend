import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { SistemaRol } from '@/types'

export const sistemaRolService = {
  async getSistemasRol(): Promise<SistemaRol[]> {
    const res = await api.get<SistemaRol[]>(API_ENDPOINTS.SISTEMAS_ROL)
    return res.data
  },

  async createSistemaRol(data: { nombre: string; descripcion?: string }): Promise<SistemaRol> {
    const res = await api.post<SistemaRol>(API_ENDPOINTS.SISTEMAS_ROL, data)
    return res.data
  },

  async updateSistemaRol(id: number, data: { nombre?: string; descripcion?: string }): Promise<SistemaRol> {
    const res = await api.put<SistemaRol>(`${API_ENDPOINTS.SISTEMAS_ROL}/${id}`, data)
    return res.data
  },

  async deleteSistemaRol(id: number): Promise<void> {
    await api.delete(`${API_ENDPOINTS.SISTEMAS_ROL}/${id}`)
  },
}
