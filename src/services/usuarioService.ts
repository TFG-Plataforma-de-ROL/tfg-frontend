import api from './api';

export const usuarioService = {
  getMe: () =>
    api.get('/api/usuarios/me').then((r) => r.data),

  updateNombre: (nombre: string) =>
    api.patch('/api/usuarios/me/nombre', { nombre }).then((r) => r.data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/api/usuarios/me/password', { currentPassword, newPassword }).then((r) => r.data),
};
