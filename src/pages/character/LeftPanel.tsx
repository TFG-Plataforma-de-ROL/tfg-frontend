import { User, Sword, BookOpen, ChevronRight, Sliders } from 'lucide-react'
import type { Item, ItemDetalle } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import { getMod, formatMod } from '@/utils/dnd'
import { getRazaInfo, getClaseInfo, getTrasfondoInfo } from '@/utils/characterDetails'

const STAT_ORDER: (keyof CharacterDraft['stats'])[] = ['fue', 'des', 'con', 'int', 'sab', 'car']

const METHOD_LABEL: Record<NonNullable<CharacterDraft['abilitySetup']>['method'], string> = {
  standard_array: 'Matriz estándar',
  point_buy:      'Compra de puntos',
  roll:           'Tirada de dados',
}

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
  onOpenWizard: () => void
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

// ── Card de características ────────────────────────────────────────────────

function CharacteristicsCard({ draft, onClick }: { draft: CharacterDraft; onClick: () => void }) {
  const setup = draft.abilitySetup
  const finalStats = setup
    ? STAT_ORDER.reduce((acc, s) => ({
        ...acc,
        [s]: setup.baseScores[s] + setup.trasfondoBonuses[s],
      }), {} as CharacterDraft['stats'])
    : null

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
      >
        <Sliders className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            Características
          </span>
          <span className={`text-sm font-medium truncate w-full ${setup ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {setup ? METHOD_LABEL[setup.method] : 'Sin configurar'}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
      {finalStats && (
        <div className="px-1">
          <div className="grid grid-cols-6 gap-1">
            {STAT_ORDER.map(s => (
              <div key={s} className="flex flex-col items-center p-1 rounded bg-secondary/40 border border-border/40">
                <span className="text-[9px] text-muted-foreground uppercase">{s}</span>
                <span className="font-bold text-xs">{finalStats[s]}</span>
                <span className="text-[9px] text-muted-foreground">{formatMod(getMod(finalStats[s]))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────

export default function LeftPanel({ draft, razas, clases, trasfondos, razaDetalle, claseDetalle, trasfondoDetalle, onOpenDialog, onOpenWizard }: Props) {
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
            {razaInfo.rasgos.length > 0 && <TagList items={razaInfo.rasgos.map(r => r.nombre)} />}
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
            {claseInfo.rasgosN1.length > 0 && <TagList items={claseInfo.rasgosN1.map(r => r.nombre)} />}
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
            {trasfondoInfo.dote && <InfoRow label="Dote" value={trasfondoInfo.dote.nombre} />}
          </div>
        )}
      </SelectionCard>

      <hr className="border-border/40" />

      <CharacteristicsCard draft={draft} onClick={onOpenWizard} />

      <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>Bono de competencia: <span className="font-bold text-foreground">+{prof}</span></p>
        {draft.id_raza === null && <p className="text-yellow-500/80">Selecciona una raza</p>}
        {draft.id_clase === null && <p className="text-yellow-500/80">Selecciona una clase</p>}
        {draft.id_trasfondo === null && <p className="text-yellow-500/80">Selecciona un trasfondo</p>}
      </div>
    </div>
  )
  
}
