import { User, Sword, BookOpen, ChevronRight } from 'lucide-react'
import type { Item } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'

interface Props {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  onChange: (partial: Partial<CharacterDraft>) => void
  onOpenDialog: (type: 'raza' | 'clase' | 'trasfondo') => void
}

interface CardProps {
  icon: React.ElementType
  label: string
  selected: Item | undefined
  onClick: () => void
}

function SelectionCard({ icon: Icon, label, selected, onClick }: CardProps) {
  return (
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
  )
}

export default function LeftPanel({ draft, razas, clases, trasfondos, onOpenDialog }: Props) {
  const prof = Math.ceil(draft.nivel / 4) + 1

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <SelectionCard
        icon={User}
        label="Raza"
        selected={razas.find(r => r.id_item === draft.id_raza)}
        onClick={() => onOpenDialog('raza')}
      />
      <SelectionCard
        icon={Sword}
        label="Clase"
        selected={clases.find(c => c.id_item === draft.id_clase)}
        onClick={() => onOpenDialog('clase')}
      />
      <SelectionCard
        icon={BookOpen}
        label="Trasfondo"
        selected={trasfondos.find(t => t.id_item === draft.id_trasfondo)}
        onClick={() => onOpenDialog('trasfondo')}
      />

      <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>Bono de competencia: <span className="font-bold text-foreground">+{prof}</span></p>
        {draft.id_raza === null && <p className="text-yellow-500/80">Selecciona una raza</p>}
        {draft.id_clase === null && <p className="text-yellow-500/80">Selecciona una clase</p>}
        {draft.id_trasfondo === null && <p className="text-yellow-500/80">Selecciona un trasfondo</p>}
      </div>
    </div>
  )
}
