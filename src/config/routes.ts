export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    HOME: '/',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    PERSONAJE_NUEVO: '/personaje/nuevo',
    PERSONAJE_EDITAR: '/personaje/:id',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    SISTEMAS_ROL: '/admin/sistemas-rol',
    PLANTILLAS: '/admin/plantillas',
    ITEMS: '/admin/items',
    USUARIOS: '/admin/usuarios',
  },
} as const

export const ROUTE_PATHS = [
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.REGISTER,
  ROUTES.PRIVATE.DASHBOARD,
  ROUTES.PRIVATE.PROFILE,
  ROUTES.PRIVATE.PERSONAJE_NUEVO,
  ROUTES.PRIVATE.PERSONAJE_EDITAR,
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.ADMIN.SISTEMAS_ROL,
  ROUTES.ADMIN.PLANTILLAS,
  ROUTES.ADMIN.ITEMS,
  ROUTES.ADMIN.USUARIOS,
]
