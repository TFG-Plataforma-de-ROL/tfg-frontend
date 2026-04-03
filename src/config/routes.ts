// Definición de rutas de la aplicación
export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    HOME: '/',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
};

export const ROUTE_PATHS = [
  ROUTES.PUBLIC.LOGIN,
  ROUTES.PUBLIC.REGISTER,
  ROUTES.PUBLIC.HOME,
  ROUTES.PRIVATE.DASHBOARD,
  ROUTES.PRIVATE.PROFILE,
  ROUTES.PRIVATE.SETTINGS,
];
