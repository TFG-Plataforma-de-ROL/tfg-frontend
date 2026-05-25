import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Item, ItemDetalle } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import ItemSelectionDialog from './ItemSelectionDialog'

// ── Nombres de rasgos que requieren selección ──────────────────────────────

const CHOICE_ESTILO_COMBATE = 'Estilo de combate'
const CHOICE_SUBCLASE_PREFIX = 'Subclase'

// ── Helpers de datos de clase ──────────────────────────────────────────────

interface Rasgo { nombre: string; descripcion: string }

function getClaseRasgosNivel(claseDetalle: ItemDetalle | null, nivel: number): Rasgo[] {
  if (!claseDetalle?.datos) return []
  const datos = claseDetalle.datos as { clase?: { rasgos?: Record<string, Rasgo[]> } }
  return datos.clase?.rasgos?.[String(nivel)] ?? []
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function LevelHeader({ nivel }: { nivel: number }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
      Nivel {nivel}
    </p>
  )
}

interface ChoiceCardProps {
  label: string
  selected: string | undefined
  onClick: () => void
}

function ChoiceCard({ label, selected, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 transition-colors text-left"
    >
      <div className="flex flex-col items-start min-w-0 flex-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
          {label}
        </span>
        <span className={`text-xs font-medium truncate w-full ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          {selected ?? 'Sin seleccionar'}
        </span>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </button>
  )
}

function AutoRasgo({ nombre }: { nombre: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/40 text-muted-foreground truncate max-w-full">
      {nombre}
    </span>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

interface Props {
  draft: CharacterDraft
  claseDetalle: ItemDetalle | null
  claseNombre: string | undefined
  estilosCombate: Item[]
  subclases: Item[]
  onChange: (partial: Partial<CharacterDraft>) => void
}

export default function LevelProgressionPanel({
  draft,
  claseDetalle,
  claseNombre,
  estilosCombate,
  subclases,
  onChange,
}: Props) {
  const [estiloDialogOpen, setEstiloDialogOpen] = useState(false)
  const [subclaseDialogOpen, setSubclaseDialogOpen] = useState(false)

  const maxNivel = 3

  const estiloSeleccionado = estilosCombate.find(e => e.id_item === draft.estilo_combate_id)
  const subclaseSeleccionada = subclases.find(s => s.id_item === draft.id_subclase)

  const niveles = Array.from({ length: maxNivel }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-3">
      {niveles.map((nivel) => {
        const rasgos = getClaseRasgosNivel(claseDetalle, nivel)

        const choices = rasgos.filter(
          r => r.nombre === CHOICE_ESTILO_COMBATE || r.nombre.startsWith(CHOICE_SUBCLASE_PREFIX)
        )
        const automaticos = rasgos.filter(
          r => r.nombre !== CHOICE_ESTILO_COMBATE && !r.nombre.startsWith(CHOICE_SUBCLASE_PREFIX)
        )

        return (
          <div key={nivel} className="flex flex-col gap-1.5">
            <LevelHeader nivel={nivel} />

            {rasgos.length === 0 && (
              <p className="text-[10px] text-muted-foreground/40 italic px-0.5">
                Selecciona una clase para ver las opciones
              </p>
            )}

            {choices.map(r => {
              if (r.nombre === CHOICE_ESTILO_COMBATE) {
                return (
                  <ChoiceCard
                    key={r.nombre}
                    label="Estilo de combate"
                    selected={estiloSeleccionado?.nombre}
                    onClick={() => setEstiloDialogOpen(true)}
                  />
                )
              }
              if (r.nombre.startsWith(CHOICE_SUBCLASE_PREFIX)) {
                return (
                  <ChoiceCard
                    key={r.nombre}
                    label="Subclase"
                    selected={subclaseSeleccionada?.nombre}
                    onClick={() => setSubclaseDialogOpen(true)}
                  />
                )
              }
              return null
            })}

            {automaticos.length > 0 && (
              <div className="flex flex-wrap gap-1 px-0.5">
                {automaticos.map(r => (
                  <AutoRasgo key={r.nombre} nombre={r.nombre} />
                ))}
              </div>
            )}
          </div>
        )
      })}

      <ItemSelectionDialog
        open={estiloDialogOpen}
        onClose={() => setEstiloDialogOpen(false)}
        title="Estilo de combate"
        items={estilosCombate}
        currentId={draft.estilo_combate_id}
        onAccept={(id) => onChange({ estilo_combate_id: id })}
      />

      <ItemSelectionDialog
        open={subclaseDialogOpen}
        onClose={() => setSubclaseDialogOpen(false)}
        title={claseNombre ? `Subclase de ${claseNombre}` : 'Subclase'}
        items={subclases}
        currentId={draft.id_subclase}
        onAccept={(id) => onChange({ id_subclase: id })}
      />
    </div>
  )
}
