import api from './api'

export const usuarioService = {
  getMe: () =>
    api.get('/api/usuarios/me').then((r) => r.data),

  updateNombre: (nombre: string) =>
    api.patch('/api/usuarios/me/nombre', { nombre }).then((r) => r.data),

  updateEmail: (email: string) =>
    api.patch('/api/usuarios/me/email', { email }).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.patch('/api/usuarios/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/api/usuarios/me/password', { currentPassword, newPassword }).then((r) => r.data),
}
