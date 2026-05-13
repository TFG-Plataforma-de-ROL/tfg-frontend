import { useState } from 'react'
import { User, Sword, BookOpen, ChevronDown } from 'lucide-react'
import type { Item } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'

interface Props {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  onChange: (partial: Partial<CharacterDraft>) => void
}

interface CardProps {
  icon: React.ElementType
  label: string
  items: Item[]
  value: number | null
  onChange: (id: number | null) => void
}

function SelectionCard({ icon: Icon, label, items, value, onChange }: CardProps) {
  const [expanded, setExpanded] = useState(false)
  const selected = items.find((i) => i.id_item === value)

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            {label}
          </span>
          <span className={`text-sm font-medium truncate w-full text-left ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {selected ? selected.nombre : 'Sin seleccionar'}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border/40 p-2 flex flex-wrap gap-1.5 bg-secondary/20">
          {items.map((item) => (
            <button
              key={item.id_item}
              type="button"
              onClick={() => {
                onChange(value === item.id_item ? null : item.id_item)
                setExpanded(false)
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                value === item.id_item
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border/60 hover:border-primary/60 text-foreground'
              }`}
            >
              {item.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LeftPanel({ draft, razas, clases, trasfondos, onChange }: Props) {
  const prof = Math.ceil(draft.nivel / 4) + 1

  return (
    <div className="flex flex-col gap-3 p-3 h-full">
      <SelectionCard
        icon={User}
        label="Raza"
        items={razas}
        value={draft.id_raza}
        onChange={(id) => onChange({ id_raza: id })}
      />
      <SelectionCard
        icon={Sword}
        label="Clase"
        items={clases}
        value={draft.id_clase}
        onChange={(id) => onChange({ id_clase: id })}
      />
      <SelectionCard
        icon={BookOpen}
        label="Trasfondo"
        items={trasfondos}
        value={draft.id_trasfondo}
        onChange={(id) => onChange({ id_trasfondo: id })}
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
