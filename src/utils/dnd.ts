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

// Caster stats by class name
const CASTER_STAT: Record<string, StatKey> = {
  'Mago': 'int',
  'Clérigo': 'sab',
}

export function getCasterStat(className: string | null | undefined): StatKey | null {
  if (!className) return null
  return CASTER_STAT[className] ?? null
}
