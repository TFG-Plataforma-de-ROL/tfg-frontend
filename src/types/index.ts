export interface Usuario {
  id: number
  nombre: string
  email: string
  avatar_url?: string | null
  created_at?: string
}

export interface SistemaRol {
  id_sistema_rol: number
  nombre: string
  descripcion?: string | null
}

export interface Personaje {
  id_personaje: number
  id_usuario: number
  id_sistema_rol: number
  nombre: string
  descripcion?: string | null
  sistema_rol?: { id_sistema_rol: number; nombre: string }
}

export interface AuthContextType {
  usuario: Usuario | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUsuario: (patch: Partial<Usuario>) => void
}

export interface ApiResponse<T> {
  status: string
  data?: T
  message?: string
  error?: string
}
