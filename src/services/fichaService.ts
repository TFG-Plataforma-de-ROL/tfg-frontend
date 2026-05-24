import api from './api'
import type { CharacterDraft } from '@/types/character'

export interface FichaResumen {
  id_ficha: number
  id_personaje: number
  id_sistema_rol: number | null
  nombre: string
}

export interface CampoValorRaw {
  id_campo_valor: number
  id_ficha: number
  id_campo_plantilla: number
  id_item_valor: number | null
  valor: unknown
  campo_plantilla: { nombre_campo: string }
}

export interface FichaDetalle extends FichaResumen {
  campos_valor: CampoValorRaw[]
}

export const fichaService = {
  getFichas: (personajeId: number): Promise<FichaResumen[]> =>
    api.get(`/api/personajes/${personajeId}/fichas`).then((r) => r.data),

  getFichaById: (personajeId: number, fichaId: number): Promise<FichaDetalle> =>
    api.get(`/api/personajes/${personajeId}/fichas/${fichaId}`).then((r) => r.data),

  createFicha: (personajeId: number, nombre: string, id_sistema_rol: number): Promise<FichaResumen> =>
    api.post(`/api/personajes/${personajeId}/fichas`, { nombre, id_sistema_rol }).then((r) => r.data),

  saveCampos: (
    personajeId: number,
    fichaId: number,
    campos: Array<{ nombre_campo: string; valor?: unknown; id_item_valor?: number }>
  ): Promise<FichaDetalle> =>
    api.put(`/api/personajes/${personajeId}/fichas/${fichaId}/campos`, { campos }).then((r) => r.data),
}

// Convert CharacterDraft → campos array for saveCampos
export function draftToCampos(
  draft: CharacterDraft
): Array<{ nombre_campo: string; valor?: unknown; id_item_valor?: number }> {
  const campos: Array<{ nombre_campo: string; valor?: unknown; id_item_valor?: number }> = [
    { nombre_campo: 'ability_setup', valor: draft.abilitySetup },
    { nombre_campo: 'stats',         valor: draft.stats },
    { nombre_campo: 'combate',     valor: { ...draft.combate, nivel: draft.nivel } },
    { nombre_campo: 'salvaciones', valor: draft.salvaciones },
    { nombre_campo: 'habilidades', valor: draft.habilidades },
    { nombre_campo: 'inspiracion', valor: { puntos: draft.inspiracion } },
    { nombre_campo: 'armas',       valor: draft.armas },
    { nombre_campo: 'equipo',      valor: draft.equipo },
    { nombre_campo: 'conjuros',    valor: draft.conjuros },
    { nombre_campo: 'rasgos',      valor: draft.rasgos },
    { nombre_campo: 'detalles',    valor: draft.detalles },
  ]

  if (draft.id_raza !== null) {
    campos.push({ nombre_campo: 'raza', id_item_valor: draft.id_raza })
  }
  if (draft.id_clase !== null) {
    campos.push({ nombre_campo: 'clase', id_item_valor: draft.id_clase })
  }
  if (draft.id_trasfondo !== null) {
    campos.push({ nombre_campo: 'trasfondo', id_item_valor: draft.id_trasfondo })
  }

  return campos
}

// Convert FichaDetalle → CharacterDraft
export function fichaToCharacterDraft(ficha: FichaDetalle): Partial<CharacterDraft> {
  const byNombre: Record<string, CampoValorRaw> = {}
  for (const cv of ficha.campos_valor) {
    byNombre[cv.campo_plantilla.nombre_campo] = cv
  }

  const get = <T>(campo: string): T | undefined => {
    const cv = byNombre[campo]
    return cv?.valor as T | undefined
  }

  const draft: Partial<CharacterDraft> = {}

  const abilitySetup = get<CharacterDraft['abilitySetup']>('ability_setup')
  if (abilitySetup) draft.abilitySetup = abilitySetup

  const stats = get<CharacterDraft['stats']>('stats')
  if (stats) draft.stats = stats

  const combate = get<CharacterDraft['combate'] & { nivel?: number }>('combate')
  if (combate) {
    draft.combate = {
      ca: combate.ca,
      pv_max: combate.pv_max,
      pv_actual: combate.pv_actual ?? combate.pv_max,
      velocidad: combate.velocidad,
    }
    if (combate.nivel !== undefined) draft.nivel = combate.nivel
  }

  const salvaciones = get<CharacterDraft['salvaciones']>('salvaciones')
  if (salvaciones) draft.salvaciones = salvaciones

  const habilidades = get<CharacterDraft['habilidades']>('habilidades')
  if (habilidades) draft.habilidades = habilidades

  const inspiracion = get<{ puntos: number }>('inspiracion')
  if (inspiracion) draft.inspiracion = inspiracion.puntos

  const armas = get<CharacterDraft['armas']>('armas')
  if (armas) draft.armas = armas

  const equipo = get<CharacterDraft['equipo']>('equipo')
  if (equipo) draft.equipo = equipo

  const conjuros = get<CharacterDraft['conjuros']>('conjuros')
  if (conjuros) draft.conjuros = conjuros

  const rasgos = get<CharacterDraft['rasgos']>('rasgos')
  if (rasgos) draft.rasgos = rasgos

  const detalles = get<CharacterDraft['detalles']>('detalles')
  if (detalles) draft.detalles = detalles

  if (byNombre['raza']?.id_item_valor) draft.id_raza = byNombre['raza'].id_item_valor
  if (byNombre['clase']?.id_item_valor) draft.id_clase = byNombre['clase'].id_item_valor
  if (byNombre['trasfondo']?.id_item_valor) draft.id_trasfondo = byNombre['trasfondo'].id_item_valor

  return draft
}
