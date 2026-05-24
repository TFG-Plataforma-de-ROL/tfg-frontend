export type CategoriaArmadura = 'ligera' | 'mediana' | 'pesada'

export interface ArmaduraBase {
  id: string
  nombre: string
  categoria: CategoriaArmadura
  ca_base: number
  fuerza_minima: number | null
  desventaja_sigilo: boolean
  coste: string
}

export const ARMADURAS: ArmaduraBase[] = [
  // ── Ligera ────────────────────────────────────────────────────────────────
  { id: 'acolchada',         nombre: 'Armadura acolchada',          categoria: 'ligera',  ca_base: 11, fuerza_minima: null, desventaja_sigilo: true,  coste: '5 po'    },
  { id: 'cuero',             nombre: 'Armadura de cuero',           categoria: 'ligera',  ca_base: 11, fuerza_minima: null, desventaja_sigilo: false, coste: '10 po'   },
  { id: 'cuero-tachonado',   nombre: 'Armadura de cuero tachonado', categoria: 'ligera',  ca_base: 12, fuerza_minima: null, desventaja_sigilo: false, coste: '45 po'   },

  // ── Mediana ───────────────────────────────────────────────────────────────
  { id: 'pieles',            nombre: 'Armadura de pieles',          categoria: 'mediana', ca_base: 12, fuerza_minima: null, desventaja_sigilo: false, coste: '10 po'   },
  { id: 'camisote-mallas',   nombre: 'Camisote de mallas',          categoria: 'mediana', ca_base: 13, fuerza_minima: null, desventaja_sigilo: false, coste: '50 po'   },
  { id: 'cota-escamas',      nombre: 'Cota de escamas',             categoria: 'mediana', ca_base: 14, fuerza_minima: null, desventaja_sigilo: true,  coste: '50 po'   },
  { id: 'peto',              nombre: 'Peto',                        categoria: 'mediana', ca_base: 14, fuerza_minima: null, desventaja_sigilo: false, coste: '400 po'  },
  { id: 'media-placa',       nombre: 'Media armadura de placas',    categoria: 'mediana', ca_base: 15, fuerza_minima: null, desventaja_sigilo: true,  coste: '750 po'  },

  // ── Pesada ────────────────────────────────────────────────────────────────
  { id: 'cota-anillas',      nombre: 'Cota de anillas',             categoria: 'pesada',  ca_base: 14, fuerza_minima: null, desventaja_sigilo: true,  coste: '30 po'   },
  { id: 'cota-mallas',       nombre: 'Cota de mallas',              categoria: 'pesada',  ca_base: 16, fuerza_minima: 13,   desventaja_sigilo: true,  coste: '75 po'   },
  { id: 'tablillas',         nombre: 'Armadura de tablillas',       categoria: 'pesada',  ca_base: 17, fuerza_minima: 15,   desventaja_sigilo: true,  coste: '200 po'  },
  { id: 'placas',            nombre: 'Armadura de placas',          categoria: 'pesada',  ca_base: 18, fuerza_minima: 15,   desventaja_sigilo: true,  coste: '1500 po' },
]

export const ESCUDO_BONUS = 2

export function calcularCA(
  armadura: ArmaduraBase | null,
  escudo: boolean,
  des: number
): number {
  const desMod = Math.floor((des - 10) / 2)
  let base: number

  if (!armadura) {
    base = 10 + desMod
  } else if (armadura.categoria === 'ligera') {
    base = armadura.ca_base + desMod
  } else if (armadura.categoria === 'mediana') {
    base = armadura.ca_base + Math.min(desMod, 2)
  } else {
    base = armadura.ca_base
  }

  return base + (escudo ? ESCUDO_BONUS : 0)
}

export function formulaCA(armadura: ArmaduraBase | null): string {
  if (!armadura) return '10 + mod. DES'
  if (armadura.categoria === 'ligera')  return `${armadura.ca_base} + mod. DES`
  if (armadura.categoria === 'mediana') return `${armadura.ca_base} + mod. DES (máx. +2)`
  return String(armadura.ca_base)
}

export function labelCategoriaArmadura(cat: CategoriaArmadura): string {
  switch (cat) {
    case 'ligera':  return 'Armadura ligera'
    case 'mediana': return 'Armadura mediana'
    case 'pesada':  return 'Armadura pesada'
  }
}

const PROF_LIGERA  = /ligera/i
const PROF_MEDIANA = /mediana|media\b/i
const PROF_PESADA  = /pesada/i
const PROF_ESCUDO  = /escudo/i

export function tieneCompetenciaArmadura(categoria: CategoriaArmadura, claseProficiencias: string[]): boolean {
  if (categoria === 'ligera')  return claseProficiencias.some(p => PROF_LIGERA.test(p))
  if (categoria === 'mediana') return claseProficiencias.some(p => PROF_MEDIANA.test(p))
  return claseProficiencias.some(p => PROF_PESADA.test(p))
}

export function tieneCompetenciaEscudo(claseProficiencias: string[]): boolean {
  return claseProficiencias.some(p => PROF_ESCUDO.test(p))
}
