/**
 * Valida si un email es válido
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida si una contraseña cumple requisitos mínimos
 */
export const validatePassword = (password: string): boolean => {
  // Al menos 6 caracteres
  return password.length >= 6;
};

/**
 * Obtiene token del localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Guarda token en localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Elimina token del localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Formatea fecha a string legible
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Simula delay (para testing)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
