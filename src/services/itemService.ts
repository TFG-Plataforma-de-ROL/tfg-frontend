import api from './api'

export interface Item {
  id_item: number
  nombre: string
  tipo_item: string
  id_sistema_rol: number | null
  todos_datos: unknown
}

export interface ItemDetalle extends Item {
  datos?: unknown
}

export const itemService = {
  getItems: (params?: { tipo_item?: string; id_sistema_rol?: number }): Promise<Item[]> =>
    api.get('/api/items', { params }).then((r) => r.data),

  getItemById: (id: number): Promise<ItemDetalle> =>
    api.get(`/api/items/${id}`).then((r) => r.data),

  createItem: (data: { nombre: string; tipo_item: string; id_sistema_rol?: number; datos?: unknown; subcategoria?: string }): Promise<Item> =>
    api.post('/api/items', data).then((r) => r.data),

  updateItem: (id: number, data: { nombre?: string; tipo_item?: string; id_sistema_rol?: number; ruta_json?: string }): Promise<Item> =>
    api.put(`/api/items/${id}`, data).then((r) => r.data),

  deleteItem: (id: number): Promise<void> =>
    api.delete(`/api/items/${id}`).then(() => undefined),
}
