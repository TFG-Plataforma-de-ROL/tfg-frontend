import type { ItemDetalle } from '@/services/itemService'

interface Rasgo { nombre: string }
type AnyObj = Record<string, unknown>

export function getRazaInfo(detalle: ItemDetalle | null) {
  if (!detalle?.datos) return null
  const d = detalle.datos as AnyObj
  const especie = (d.especie ?? d) as AnyObj
  const tamaño = especie.tamaño as string | undefined
  const velocidad = especie.velocidad as number | undefined
  const rasgos = especie.rasgos as Rasgo[] | undefined
  return { tamaño, velocidad, rasgos: rasgos?.map((r) => r.nombre) ?? [] }
}

export function getClaseInfo(detalle: ItemDetalle | null) {
  if (!detalle?.datos) return null
  const d = detalle.datos as AnyObj
  const clase = (d.clase ?? d) as AnyObj
  const vida = clase.vida as AnyObj | undefined
  const dado = vida?.dado as string | undefined
  const nivel1 = vida?.nivel_1 as number | undefined
  const competencias = clase.competencias as AnyObj | undefined
  const salvaciones = competencias?.salvaciones as string[] | undefined
  const rasgos = clase.rasgos as Record<string, Rasgo[]> | undefined
  const rasgosN1 = rasgos?.['1']?.map((r) => r.nombre) ?? []
  return { dado, nivel1, salvaciones, rasgosN1 }
}

export function getTrasfondoInfo(detalle: ItemDetalle | null) {
  if (!detalle?.datos) return null
  const d = detalle.datos as AnyObj
  const trasfondo = (d.trasfondo ?? d) as AnyObj
  const caracteristicas = trasfondo.mejora_caracteristicas as string[] | undefined
  const habilidades = trasfondo.competencias_habilidad as string[] | undefined
  const herramientas = trasfondo.competencias_herramienta as string[] | undefined
  const dote = trasfondo.dote as string | undefined
  return { caracteristicas, habilidades, herramientas, dote }
}
