import type { Item } from '@/services/itemService'
import type { CharacterDraft } from '@/types/character'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  draft: CharacterDraft
  razas: Item[]
  clases: Item[]
  trasfondos: Item[]
  onChange: (partial: Partial<CharacterDraft>) => void
}

interface SelectProps {
  label: string
  items: Item[]
  value: number | null
  onChange: (id: number | null) => void
}

function ItemSelector({ label, items, value, onChange }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.id_item}
            type="button"
            onClick={() => onChange(value === item.id_item ? null : item.id_item)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
              value === item.id_item
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-secondary border-border hover:border-primary/60 text-foreground'
            }`}
          >
            {item.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LeftPanel({ draft, razas, clases, trasfondos, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      {/* Nombre del personaje */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nombre del Personaje</Label>
        <Input
          value={draft.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Nombre..."
          className="border-border/60 bg-secondary"
        />
      </div>

      {/* Nivel */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nivel</Label>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ nivel: n })}
              className={`w-8 h-8 rounded-md text-xs font-bold border transition-all ${
                draft.nivel === n
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-secondary border-border hover:border-primary/60 text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Raza */}
      <ItemSelector
        label="Raza"
        items={razas}
        value={draft.id_raza}
        onChange={(id) => onChange({ id_raza: id })}
      />

      {/* Clase */}
      <ItemSelector
        label="Clase"
        items={clases}
        value={draft.id_clase}
        onChange={(id) => onChange({ id_clase: id })}
      />

      {/* Trasfondo */}
      <ItemSelector
        label="Trasfondo"
        items={trasfondos}
        value={draft.id_trasfondo}
        onChange={(id) => onChange({ id_trasfondo: id })}
      />

      {/* Info rápida */}
      <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-1 text-xs text-muted-foreground">
        <p>Nivel {draft.nivel} · Bono de competencia: +{Math.ceil(draft.nivel / 4) + 1}</p>
        {draft.id_raza === null && <p className="text-yellow-500/80">Selecciona una raza</p>}
        {draft.id_clase === null && <p className="text-yellow-500/80">Selecciona una clase</p>}
        {draft.id_trasfondo === null && <p className="text-yellow-500/80">Selecciona un trasfondo</p>}
      </div>
    </div>
  )
}
