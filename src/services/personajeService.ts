import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { Personaje } from '@/types'

export const personajeService = {
  async getPersonajes(): Promise<Personaje[]> {
    const res = await api.get<Personaje[]>(API_ENDPOINTS.PERSONAJES)
    return res.data
  },

  async getPersonajeById(id: number): Promise<Personaje> {
    const res = await api.get<Personaje>(API_ENDPOINTS.PERSONAJE_BY_ID(id))
    return res.data
  },

  async createPersonaje(data: {
    nombre: string
    id_sistema_rol: number
    descripcion?: string
  }): Promise<Personaje> {
    const res = await api.post<Personaje>(API_ENDPOINTS.PERSONAJES, data)
    return res.data
  },

  async updatePersonaje(
    id: number,
    data: { nombre?: string; descripcion?: string }
  ): Promise<void> {
    await api.put(API_ENDPOINTS.PERSONAJE_BY_ID(id), data)
  },

  async deletePersonaje(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.PERSONAJE_BY_ID(id))
  },
}
