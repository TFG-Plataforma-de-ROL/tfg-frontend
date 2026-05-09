// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',

  // Health
  HEALTH: '/api/health',

  // Sistemas de Rol
  SISTEMAS_ROL: '/api/sistemas-rol',
  SISTEMA_ROL_BY_ID: (id: number) => `/api/sistemas-rol/${id}`,

  // Personajes
  PERSONAJES: '/api/personajes',
  PERSONAJE_BY_ID: (id: number) => `/api/personajes/${id}`,

  // Fichas
  FICHAS: (personajeId: number) => `/api/personajes/${personajeId}/fichas`,
  FICHA_BY_ID: (personajeId: number, fichaId: number) =>
    `/api/personajes/${personajeId}/fichas/${fichaId}`,

  // CampoValor
  VALORES: (personajeId: number, fichaId: number) =>
    `/api/personajes/${personajeId}/fichas/${fichaId}/valores`,
  VALOR_BY_ID: (personajeId: number, fichaId: number, valorId: number) =>
    `/api/personajes/${personajeId}/fichas/${fichaId}/valores/${valorId}`,

  // Plantillas
  PLANTILLAS: '/api/plantillas',
  PLANTILLA_BY_ID: (id: number) => `/api/plantillas/${id}`,

  // Campos de plantilla
  CAMPOS: (plantillaId: number) => `/api/plantillas/${plantillaId}/campos`,
  CAMPO_BY_ID: (plantillaId: number, campoId: number) => `/api/plantillas/${plantillaId}/campos/${campoId}`,

  // Items
  ITEMS: '/api/items',
  ITEM_BY_ID: (id: number) => `/api/items/${id}`,
};

// UI
export const TOAST_DURATION = 3000;
export const MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGIN_ERROR: 'Error al iniciar sesión',
  REGISTER_SUCCESS: 'Registro completado',
  REGISTER_ERROR: 'Error al registrarse',
  LOGOUT_SUCCESS: 'Sesión cerrada',
  DELETE_SUCCESS: 'Elemento eliminado',
  DELETE_ERROR: 'Error al eliminar',
  SAVE_SUCCESS: 'Cambios guardados',
  SAVE_ERROR: 'Error al guardar',
};

// STORAGE
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};
