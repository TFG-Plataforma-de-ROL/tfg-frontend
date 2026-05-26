import type { StatBlock, SkillProficiencies } from '@/types/character'

export type StatKey = keyof StatBlock

export const STAT_NAMES: Record<StatKey, string> = {
  fue: 'FUE', des: 'DES', con: 'CON', int: 'INT', sab: 'SAB', car: 'CAR',
}

export interface SkillDef {
  nombre: string
  stat: StatKey
  key: keyof SkillProficiencies
}

export const SKILLS: SkillDef[] = [
  { nombre: 'Acrobacias',       stat: 'des', key: 'acrobacias' },
  { nombre: 'Atletismo',        stat: 'fue', key: 'atletismo' },
  { nombre: 'Engaño',           stat: 'car', key: 'engano' },
  { nombre: 'Historia',         stat: 'int', key: 'historia' },
  { nombre: 'Intimidación',     stat: 'car', key: 'intimidacion' },
  { nombre: 'Interpretación',   stat: 'car', key: 'interpretacion' },
  { nombre: 'Investigación',    stat: 'int', key: 'investigacion' },
  { nombre: 'Juego de Manos',   stat: 'des', key: 'juegoDeManos' },
  { nombre: 'Medicina',         stat: 'sab', key: 'medicina' },
  { nombre: 'Naturaleza',       stat: 'int', key: 'naturaleza' },
  { nombre: 'Percepción',       stat: 'sab', key: 'percepcion' },
  { nombre: 'Perspicacia',      stat: 'sab', key: 'perspicacia' },
  { nombre: 'Persuasión',       stat: 'car', key: 'persuasion' },
  { nombre: 'Religión',         stat: 'int', key: 'religion' },
  { nombre: 'Sigilo',           stat: 'des', key: 'sigilo' },
  { nombre: 'Supervivencia',    stat: 'sab', key: 'supervivencia' },
  { nombre: 'Trato Animales',   stat: 'sab', key: 'trato_con_animales' },
  { nombre: 'Arcanos',          stat: 'int', key: 'arcanos' },
]

export function getMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getProfBonus(nivel: number): number {
  return Math.ceil(nivel / 4) + 1
}

export function getSkillMod(stat: number, proficient: boolean, nivel: number): number {
  return getMod(stat) + (proficient ? getProfBonus(nivel) : 0)
}

export function getPassivePerception(sab: number, profPercepcion: boolean, nivel: number): number {
  return 10 + getSkillMod(sab, profPercepcion, nivel)
}

export function getInitiative(des: number): number {
  return getMod(des)
}

export function getSpellDC(stat: number, nivel: number): number {
  return 8 + getProfBonus(nivel) + getMod(stat)
}

export function getSpellAttackBonus(stat: number, nivel: number): number {
  return getProfBonus(nivel) + getMod(stat)
}

export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Caster stats by class/subclass name
const CASTER_STAT: Record<string, StatKey> = {
  'Mago': 'int',
  'Clérigo': 'sab',
  'Caballero Eldritch': 'int',
  'Embaucador Arcano': 'int',
}

export function getCasterStat(className: string | null | undefined): StatKey | null {
  if (!className) return null
  return CASTER_STAT[className] ?? null
}

// ── Spell slot tables ──────────────────────────────────────────────────────

export type TipoCaster = 'completo' | 'tercio'

// Index 0 = level 1, index 19 = level 20. Each inner array: slots per spell level (1–9)
const FULL_CASTER_SLOTS: number[][] = [
  [2,0,0,0,0,0,0,0,0], // 1
  [3,0,0,0,0,0,0,0,0], // 2
  [4,2,0,0,0,0,0,0,0], // 3
  [4,3,0,0,0,0,0,0,0], // 4
  [4,3,2,0,0,0,0,0,0], // 5
  [4,3,3,0,0,0,0,0,0], // 6
  [4,3,3,1,0,0,0,0,0], // 7
  [4,3,3,2,0,0,0,0,0], // 8
  [4,3,3,3,1,0,0,0,0], // 9
  [4,3,3,3,2,0,0,0,0], // 10
  [4,3,3,3,2,1,0,0,0], // 11
  [4,3,3,3,2,1,0,0,0], // 12
  [4,3,3,3,2,1,1,0,0], // 13
  [4,3,3,3,2,1,1,0,0], // 14
  [4,3,3,3,2,1,1,1,0], // 15
  [4,3,3,3,2,1,1,1,0], // 16
  [4,3,3,3,2,1,1,1,1], // 17
  [4,3,3,3,3,1,1,1,1], // 18
  [4,3,3,3,3,2,1,1,1], // 19
  [4,3,3,3,3,2,2,1,1], // 20
]

// Index 0 = level 1. Only spell levels 1–4 are relevant (tercio casters)
const THIRD_CASTER_SLOTS: number[][] = [
  [0,0,0,0], // 1
  [0,0,0,0], // 2
  [2,0,0,0], // 3
  [3,0,0,0], // 4
  [3,0,0,0], // 5
  [3,0,0,0], // 6
  [4,2,0,0], // 7
  [4,2,0,0], // 8
  [4,2,0,0], // 9
  [4,3,0,0], // 10
  [4,3,0,0], // 11
  [4,3,0,0], // 12
  [4,3,2,0], // 13
  [4,3,2,0], // 14
  [4,3,2,0], // 15
  [4,3,3,0], // 16
  [4,3,3,0], // 17
  [4,3,3,0], // 18
  [4,3,3,1], // 19
  [4,3,3,1], // 20
]

export interface LanzamientoInfo {
  tipo: TipoCaster
  stat: StatKey
  trucos_por_nivel: number[]
}

// Fallback hardcoded table for when JSON datos isn't available
const CASTER_INFO_POR_NOMBRE: Record<string, LanzamientoInfo> = {
  'Mago':              { tipo: 'completo', stat: 'int', trucos_por_nivel: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
  'Clérigo':           { tipo: 'completo', stat: 'sab', trucos_por_nivel: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
  'Caballero Eldritch':{ tipo: 'tercio',   stat: 'int', trucos_por_nivel: [0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3] },
  'Embaucador Arcano': { tipo: 'tercio',   stat: 'int', trucos_por_nivel: [0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4] },
}

export function getLanzamientoInfo(
  claseDetalle: { datos?: unknown; nombre?: string } | null,
  subclaseDetalle: { datos?: unknown; nombre?: string } | null,
): LanzamientoInfo | null {
  // 1. Try JSON datos from class
  const claseDatos = (claseDetalle?.datos as Record<string, unknown> | undefined)
  const claseLC = (claseDatos?.clase as Record<string, unknown> | undefined)
    ?.lanzamiento_conjuros as LanzamientoInfo | undefined
  if (claseLC?.tipo) return claseLC

  // 2. Try JSON datos from subclass
  const subDatos = (subclaseDetalle?.datos as Record<string, unknown> | undefined)
  const subLC = (subDatos?.subclase as Record<string, unknown> | undefined)
    ?.lanzamiento_conjuros as LanzamientoInfo | undefined
  if (subLC?.tipo) return subLC

  // 3. Fallback: name-based lookup (works even when datos isn't loaded yet)
  if (claseDetalle?.nombre && CASTER_INFO_POR_NOMBRE[claseDetalle.nombre]) {
    return CASTER_INFO_POR_NOMBRE[claseDetalle.nombre]
  }
  if (subclaseDetalle?.nombre && CASTER_INFO_POR_NOMBRE[subclaseDetalle.nombre]) {
    return CASTER_INFO_POR_NOMBRE[subclaseDetalle.nombre]
  }

  return null
}

export function getSpellSlots(nivel: number, tipo: TipoCaster): number[] {
  const idx = Math.min(Math.max(nivel, 1), 20) - 1
  return tipo === 'completo' ? FULL_CASTER_SLOTS[idx] : THIRD_CASTER_SLOTS[idx]
}

export function getCantripCount(nivel: number, trucos_por_nivel: number[]): number {
  const idx = Math.min(Math.max(nivel, 1), 20) - 1
  return trucos_por_nivel[idx] ?? 0
}
