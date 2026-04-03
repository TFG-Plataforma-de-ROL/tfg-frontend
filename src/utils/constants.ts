// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Usuarios
  USERS: '/api/usuarios',
  USER_BY_ID: (id: number) => `/api/usuarios/${id}`,
  
  // Tareas
  TASKS: '/api/tareas',
  TASK_BY_ID: (id: number) => `/api/tareas/${id}`,
  
  // Health
  HEALTH: '/api/health',
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
