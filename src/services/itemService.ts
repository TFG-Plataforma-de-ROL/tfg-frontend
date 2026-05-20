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
  getItems: (tipoItem: string, idSistemaRol: number): Promise<Item[]> =>
    api.get('/api/items', { params: { tipo_item: tipoItem, id_sistema_rol: idSistemaRol } }).then((r) => r.data),

  getItemById: (id: number): Promise<ItemDetalle> =>
    api.get(`/api/items/${id}`).then((r) => r.data),
}
