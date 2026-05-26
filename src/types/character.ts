export interface StatBlock {
  fue: number
  des: number
  con: number
  int: number
  sab: number
  car: number
}

export interface SavingThrows {
  fue: boolean
  des: boolean
  con: boolean
  int: boolean
  sab: boolean
  car: boolean
}

export interface SkillProficiencies {
  acrobacias: boolean
  atletismo: boolean
  engano: boolean
  historia: boolean
  intimidacion: boolean
  interpretacion: boolean
  investigacion: boolean
  juegoDeManos: boolean
  medicina: boolean
  naturaleza: boolean
  percepcion: boolean
  perspicacia: boolean
  persuasion: boolean
  religion: boolean
  sigilo: boolean
  supervivencia: boolean
  trato_con_animales: boolean
  arcanos: boolean
}

export interface CombatStats {
  ca: number
  pv_max: number
  pv_actual: number
  velocidad: number
}

export interface WeaponEntry {
  id: string
  nombre: string
  bonus_ataque: number
  dano: string
  tipo_dano: string
  categoria?: string
  propiedades?: string[]
  fuente?: 'clase' | 'trasfondo'
}

export interface EquipmentEntry {
  id: string
  nombre: string
  cantidad: number
  carga?: number
  fuente?: 'clase' | 'trasfondo'
}

export interface EquipoInicial {
  clase_opcion: string | null
  trasfondo_opcion: 'a' | 'b' | null
}

export interface Monedas {
  platino: number
  oro: number
  plata: number
  cobre: number
}

export interface SpellEntry {
  id: string
  nombre: string
  nivel: number
  escuela: string
  descripcion: string
  tiempo_lanzamiento?: string
  alcance?: string
  duracion?: string
  concentracion?: boolean
  ritual?: boolean
}

export interface FeatEntry {
  id: string
  nombre: string
  descripcion: string
}

export interface CharacterDetalles {
  historia: string
  rasgos_de_personalidad: string
  ideales: string
  vinculos: string
  defectos: string
  apariencia: string
  edad: string
  altura: string
  peso: string
  ojos: string
  piel: string
  pelo: string
}

export type AbilityMethod = 'standard_array' | 'point_buy' | 'roll'

export interface AbilitySetup {
  method: AbilityMethod
  baseScores: StatBlock
  trasfondoBonuses: StatBlock
}

export interface CharacterDraft {
  // Identidad
  nombre: string
  nivel: number
  hp_por_nivel: number[]
  id_raza: number | null
  id_clase: number | null
  id_trasfondo: number | null
  habilidades_clase: (keyof SkillProficiencies)[]
  habilidades_trasfondo: (keyof SkillProficiencies)[]

  // Progresión de niveles
  estilo_combate_id: number | null
  id_subclase: number | null

  // Stats
  abilitySetup: AbilitySetup | null
  stats: StatBlock
  combate: CombatStats
  salvaciones: SavingThrows
  habilidades: SkillProficiencies
  inspiracion: number  // 0-3

  // Defensa
  armadura_equipada: string | null   // id de ArmaduraBase
  escudo_equipado: boolean

  // Tabs
  armas: WeaponEntry[]
  equipo: EquipmentEntry[]
  equipo_inicial: EquipoInicial
  monedas: Monedas
  conjuros: SpellEntry[]
  casillas_usadas: Record<number, number>
  rasgos: FeatEntry[]
  detalles: CharacterDetalles
}
