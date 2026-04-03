// Tipos de Usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  created_at?: string;
}

// Tipos de Tarea
export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  usuario_id: number;
  created_at?: string;
}

// Tipos de Auth
export interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Tipos de API Response
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}
