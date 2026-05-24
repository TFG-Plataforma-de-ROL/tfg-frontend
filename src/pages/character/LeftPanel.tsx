import { User, Sword, BookOpen, ChevronRight } from 'lucide-react'
import type { Item, ItemDetalle } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'

interface Props {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  razaDetalle: ItemDetalle | null
  claseDetalle: ItemDetalle | null
  trasfondoDetalle: ItemDetalle | null
  onChange: (partial: Partial<CharacterDraft>) => void
  onOpenDialog: (type: 'raza' | 'clase' | 'trasfondo') => void
}

interface CardProps {
  icon: React.ElementType
  label: string
  selected: Item | undefined
  onClick: () => void
  children?: React.ReactNode
}

function SelectionCard({ icon: Icon, label, selected, onClick, children }: CardProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
        onClick={onClick}
      >
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            {label}
          </span>
          <span className={`text-sm font-medium truncate w-full ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {selected ? selected.nombre : 'Sin seleccionar'}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {children}
    </div>
  )
}

// ── Helpers para extraer datos del campo `datos` del ItemDetalle ───────────

interface Rasgo { nombre: string }
type AnyObj = Record<string, unknown>

function getRazaInfo(detalle: ItemDetalle | null) {
  if (!detalle?.datos) return null
  const d = detalle.datos as AnyObj
  const especie = (d.especie ?? d) as AnyObj
  const tamaño = especie.tamaño as string | undefined
  const velocidad = especie.velocidad as number | undefined
  const rasgos = especie.rasgos as Rasgo[] | undefined
  return { tamaño, velocidad, rasgos: rasgos?.map((r) => r.nombre) ?? [] }
}

function getClaseInfo(detalle: ItemDetalle | null) {
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

function getTrasfondoInfo(detalle: ItemDetalle | null) {
  if (!detalle?.datos) return null
  const d = detalle.datos as AnyObj
  const trasfondo = (d.trasfondo ?? d) as AnyObj
  const caracteristicas = trasfondo.mejora_caracteristicas as string[] | undefined
  const habilidades = trasfondo.competencias_habilidad as string[] | undefined
  const herramientas = trasfondo.competencias_herramienta as string[] | undefined
  const dote = trasfondo.dote as string | undefined
  return { caracteristicas, habilidades, herramientas, dote }
}

// ── Bloque de info compacto ────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-[10px] leading-tight">
      <span className="text-muted-foreground/60 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="text-muted-foreground truncate">{value}</span>
    </div>
  )
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/40 text-muted-foreground truncate max-w-full">
          {item}
        </span>
      ))}
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

export default function LeftPanel({ draft, razas, clases, trasfondos, razaDetalle, claseDetalle, trasfondoDetalle, onOpenDialog }: Props) {
  const prof = Math.ceil(draft.nivel / 4) + 1

  const razaItem = razas.find((r) => r.id_item === draft.id_raza)
  const claseItem = clases.find((c) => c.id_item === draft.id_clase)
  const trasfondoItem = trasfondos.find((t) => t.id_item === draft.id_trasfondo)

  const razaInfo = getRazaInfo(razaDetalle)
  const claseInfo = getClaseInfo(claseDetalle)
  const trasfondoInfo = getTrasfondoInfo(trasfondoDetalle)

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <SelectionCard
        icon={User}
        label="Raza"
        selected={razaItem}
        onClick={() => onOpenDialog('raza')}
      >
        {razaInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {(razaInfo.tamaño || razaInfo.velocidad) && (
              <InfoRow
                label="Mov"
                value={[razaInfo.tamaño, razaInfo.velocidad ? `${razaInfo.velocidad} pies` : ''].filter(Boolean).join(' · ')}
              />
            )}
            {razaInfo.rasgos.length > 0 && <TagList items={razaInfo.rasgos} />}
          </div>
        )}
      </SelectionCard>

      <SelectionCard
        icon={Sword}
        label="Clase"
        selected={claseItem}
        onClick={() => onOpenDialog('clase')}
      >
        {claseInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {(claseInfo.dado || claseInfo.nivel1) && (
              <InfoRow
                label="Golpe"
                value={[claseInfo.dado, claseInfo.nivel1 ? `${claseInfo.nivel1} PV nv1` : ''].filter(Boolean).join(' · ')}
              />
            )}
            {claseInfo.salvaciones && claseInfo.salvaciones.length > 0 && (
              <InfoRow label="Salv" value={claseInfo.salvaciones.join(', ')} />
            )}
            {claseInfo.rasgosN1.length > 0 && <TagList items={claseInfo.rasgosN1} />}
          </div>
        )}
      </SelectionCard>

      <SelectionCard
        icon={BookOpen}
        label="Trasfondo"
        selected={trasfondoItem}
        onClick={() => onOpenDialog('trasfondo')}
      >
        {trasfondoInfo && (
          <div className="px-1 flex flex-col gap-1.5">
            {trasfondoInfo.caracteristicas && trasfondoInfo.caracteristicas.length > 0 && (
              <InfoRow label="Mejora" value={trasfondoInfo.caracteristicas.join(', ')} />
            )}
            {trasfondoInfo.habilidades && trasfondoInfo.habilidades.length > 0 && (
              <InfoRow label="Hab" value={trasfondoInfo.habilidades.join(', ')} />
            )}
            {trasfondoInfo.herramientas && trasfondoInfo.herramientas.length > 0 && (
              <InfoRow label="Tool" value={trasfondoInfo.herramientas.join(', ')} />
            )}
            {trasfondoInfo.dote && <InfoRow label="Dote" value={trasfondoInfo.dote} />}
          </div>
        )}
      </SelectionCard>

      <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>Bono de competencia: <span className="font-bold text-foreground">+{prof}</span></p>
        {draft.id_raza === null && <p className="text-yellow-500/80">Selecciona una raza</p>}
        {draft.id_clase === null && <p className="text-yellow-500/80">Selecciona una clase</p>}
        {draft.id_trasfondo === null && <p className="text-yellow-500/80">Selecciona un trasfondo</p>}
      </div>
    </div>
  )
  
}
