import type { WeaponEntry, EquipmentEntry } from '@/types/character'
import { ARMAS } from '@/data/armasData'
import { ARMADURAS } from '@/data/armadurasData'

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function singularize(s: string): string {
  if (s.endsWith('nas')) return s.slice(0, -1)   // jabalinas → jabalina
  if (s.endsWith('gas')) return s.slice(0, -1)   // dagas → daga
  if (s.endsWith('as'))  return s.slice(0, -1)   // genérico -as
  if (s.endsWith('es'))  return s.slice(0, -2)   // genérico -es
  if (s.endsWith('s'))   return s.slice(0, -1)
  return s
}

function findArma(name: string) {
  const n = norm(name)
  return ARMAS.find(a => norm(a.nombre) === n || norm(a.nombre) === singularize(n))
}

function findArmadura(name: string) {
  const n = norm(name)
  return ARMADURAS.find(a => norm(a.nombre) === n)
}

export interface ClasificacionEquipo {
  armaduraId: string | null
  escudo: boolean
  armas: Array<Omit<WeaponEntry, 'id'>>
  equipo: Array<Omit<EquipmentEntry, 'id'>>
}

export function clasificarEquipo(
  items: string[],
  fuente: 'clase' | 'trasfondo',
): ClasificacionEquipo {
  const result: ClasificacionEquipo = { armaduraId: null, escudo: false, armas: [], equipo: [] }

  for (const raw of items) {
    const str = raw.trim()

    // Parse leading quantity: "8 Jabalinas" → qty=8, name="Jabalinas"
    const qtyMatch = str.match(/^(\d+)\s+(.+)$/)
    const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1
    const name = qtyMatch ? qtyMatch[2] : str

    // Shield
    if (norm(name) === 'escudo') {
      result.escudo = true
      continue
    }

    // Armor
    const armadura = findArmadura(name)
    if (armadura) {
      result.armaduraId = armadura.id
      continue
    }

    // Weapon: add 1 WeaponEntry, extras go to equipo
    const arma = findArma(name)
    if (arma) {
      result.armas.push({
        nombre: arma.nombre,
        bonus_ataque: 0,
        dano: arma.dano,
        tipo_dano: arma.tipo_dano,
        categoria: arma.categoria,
        fuente,
      })
      if (qty > 1) {
        result.equipo.push({ nombre: `${qty - 1} ${arma.nombre}`, cantidad: qty - 1, fuente })
      }
      continue
    }

    // Generic inventory item
    result.equipo.push({ nombre: str, cantidad: 1, fuente })
  }

  return result
}
