import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { SistemaRol } from '@/types'

export const sistemaRolService = {
  async getSistemasRol(): Promise<SistemaRol[]> {
    const res = await api.get<SistemaRol[]>(API_ENDPOINTS.SISTEMAS_ROL)
    return res.data
  },
}
