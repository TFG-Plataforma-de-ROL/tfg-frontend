import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { itemService, type Item } from '@/services/itemService'

// ── JSON shapes ──────────────────────────────────────────────────────────────

interface Rasgo { nombre: string; descripcion: string }

interface DatosRaza {
  especie: {
    nombre: string
    tamaño: string
    velocidad: number
    rasgos: Rasgo[]
  }
}

interface DatosClase {
  clase: {
    nombre: string
    vida: { dado: string; nivel_1: number; subsecuentes: string }
    competencias: {
      armaduras: string[]
      armas: string[]
      salvaciones: string[]
      habilidades: { elige: number; de: string[] }
    }
    rasgos: Record<string, Rasgo[]>
  }
}

interface DatosTrasfondo {
  trasfondo: {
    nombre: string
    competencias_habilidad: string[]
    competencias_herramienta: string[]
    equipo: string[]
    dote: string
  }
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{title}</p>
      {children}
    </div>
  )
}

function DetailRaza({ datos }: { datos: DatosRaza }) {
  const e = datos.especie
  return (
    <>
      <Section title="Tamaño / Velocidad">
        <p className="text-sm">{e.tamaño} · {e.velocidad} pies</p>
      </Section>
      <Section title="Rasgos">
        {e.rasgos.map((r) => (
          <div key={r.nombre} className="mb-2">
            <p className="text-sm font-semibold">{r.nombre}</p>
            <p className="text-sm text-muted-foreground">{r.descripcion}</p>
          </div>
        ))}
      </Section>
    </>
  )
}

function DetailClase({ datos }: { datos: DatosClase }) {
  const c = datos.clase
  const rasgosN1 = c.rasgos['1'] ?? []
  return (
    <>
      <Section title="Dado de golpe">
        <p className="text-sm">{c.vida.dado} · {c.vida.nivel_1} PV en nivel 1</p>
      </Section>
      <Section title="Salvaciones">
        <p className="text-sm">{c.competencias.salvaciones.join(', ')}</p>
      </Section>
      {c.competencias.armaduras.length > 0 && (
        <Section title="Competencias en armaduras">
          <p className="text-sm">{c.competencias.armaduras.join(', ')}</p>
        </Section>
      )}
      <Section title="Competencias en armas">
        <p className="text-sm">{c.competencias.armas.join(', ')}</p>
      </Section>
      <Section title="Habilidades">
        <p className="text-sm">Elige {c.competencias.habilidades.elige}: {c.competencias.habilidades.de.join(', ')}</p>
      </Section>
      {rasgosN1.length > 0 && (
        <Section title="Rasgos de nivel 1">
          {rasgosN1.map((r) => (
            <div key={r.nombre} className="mb-2">
              <p className="text-sm font-semibold">{r.nombre}</p>
              <p className="text-sm text-muted-foreground">{r.descripcion}</p>
            </div>
          ))}
        </Section>
      )}
    </>
  )
}

function DetailTrasfondo({ datos }: { datos: DatosTrasfondo }) {
  const t = datos.trasfondo
  return (
    <>
      <Section title="Competencias en habilidades">
        <p className="text-sm">{t.competencias_habilidad.join(', ')}</p>
      </Section>
      {t.competencias_herramienta.length > 0 && (
        <Section title="Competencias en herramientas">
          <p className="text-sm">{t.competencias_herramienta.join(', ')}</p>
        </Section>
      )}
      <Section title="Equipo inicial">
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
          {t.equipo.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </Section>
      <Section title="Don">
        <p className="text-sm">{t.dote}</p>
      </Section>
    </>
  )
}

function ItemDetail({ item, datos }: { item: Item; datos: unknown }) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">{item.nombre}</h3>
      {datos == null && <p className="text-sm text-muted-foreground italic">Sin descripción disponible.</p>}
      {item.tipo_item === 'raza'      && datos != null && <DetailRaza      datos={datos as DatosRaza}      />}
      {item.tipo_item === 'clase'     && datos != null && <DetailClase     datos={datos as DatosClase}     />}
      {item.tipo_item === 'trasfondo' && datos != null && <DetailTrasfondo datos={datos as DatosTrasfondo} />}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  title: string
  items: Item[]
  currentId: number | null
  onAccept: (id: number | null) => void
}

export default function ItemSelectionDialog({ open, onClose, title, items, currentId, onAccept }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(currentId)
  const [loading, setLoading] = useState(false)
  const cache = useRef<Map<number, unknown>>(new Map())

  const [detailData, setDetailData] = useState<{ id: number; datos: unknown } | null>(null)

  useEffect(() => {
    if (open) {
      setPendingId(currentId)
    }
  }, [open, currentId])

  const displayId = pendingId

  useEffect(() => {
    if (displayId === null) { setDetailData(null); return }
    if (cache.current.has(displayId)) {
      setDetailData({ id: displayId, datos: cache.current.get(displayId) })
      return
    }
    setLoading(true)
    itemService.getItemById(displayId).then((res) => {
      cache.current.set(displayId, res.datos ?? null)
      setDetailData({ id: displayId, datos: res.datos ?? null })
    }).finally(() => setLoading(false))
  }, [displayId])

  const displayItem = items.find(i => i.id_item === displayId) ?? null

  const handleAccept = () => {
    onAccept(pendingId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl h-[540px] p-0 flex flex-col gap-0 [&>button]:hidden">
        <div className="px-5 py-3 border-b border-border/40 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{title}</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Lista */}
          <div className="w-52 shrink-0 border-r border-border/40 overflow-y-auto">
            {items.map(item => (
              <button
                key={item.id_item}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-border/20 last:border-0 ${
                  pendingId === item.id_item
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'hover:bg-secondary/60 text-foreground'
                }`}
                onClick={() => setPendingId(item.id_item === pendingId ? null : item.id_item)}
              >
                {item.nombre}
              </button>
            ))}
          </div>

          {/* Detalle */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!displayItem && (
              <p className="text-sm text-muted-foreground italic">
                Selecciona una opción para ver sus detalles.
              </p>
            )}
            {displayItem && loading && (
              <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
            )}
            {displayItem && !loading && detailData?.id === displayItem.id_item && (
              <ItemDetail item={displayItem} datos={detailData.datos} />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/40 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleAccept}>Aceptar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
