// --- Auth ---

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// --- Dominio ---

export interface SistemaRol {
  id_sistema_rol: number;
  nombre: string;
  descripcion?: string;
  nivel_maximo: number;
}

export interface Personaje {
  id_personaje: number;
  id_usuario: number;
  id_sistema_rol: number;
  nombre: string;
  descripcion?: string;
  sistema_rol?: SistemaRol;
}

export interface Item {
  id_item: number;
  id_sistema_rol?: number;
  tipo_item: string;
  nombre: string;
  todos_datos?: Record<string, unknown>;
}

export interface CampoPlantilla {
  id_campo_plantilla: number;
  id_plantilla: number;
  nombre_campo: string;
  nivel_disponible: number;
  tipo_campo: 'texto' | 'numero' | 'item';
  filtro_item?: string;
}

export interface FichaPlantilla {
  id_plantilla: number;
  id_sistema_rol?: number;
  nombre_plantilla: string;
  version: number;
  campos: CampoPlantilla[];
}

export interface FichaPersonaje {
  id_ficha: number;
  id_personaje: number;
  id_sistema_rol?: number;
  nombre: string;
}

export interface CampoValor {
  id_campo_valor: number;
  id_ficha: number;
  id_campo_plantilla: number;
  id_item_valor?: number | null;
  valor_texto?: string | null;
  valor_numero?: number | null;
  campo_plantilla?: CampoPlantilla;
  item_valor?: Item;
}

// --- API Response ---

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}
