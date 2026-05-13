export const APP_NAME = 'ProyectoRol'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  LOGIN:    '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT:   '/api/auth/logout',

  USUARIOS:        '/api/usuarios',
  USUARIO_ME:      '/api/usuarios/me',
  USUARIO_BY_ID:   (id: number) => `/api/usuarios/${id}`,

  PERSONAJES:      '/api/personajes',
  PERSONAJE_BY_ID: (id: number) => `/api/personajes/${id}`,
  PERSONAJE_EXPORT:(id: number) => `/api/personajes/${id}/export`,

  SISTEMAS_ROL:    '/api/sistemas-rol',

  HEALTH: '/api/health',
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA:  'user_data',
}
