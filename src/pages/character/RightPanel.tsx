import { useState } from 'react'
import type { CharacterDraft, WeaponEntry, EquipmentEntry, SpellEntry, FeatEntry } from '@/types/character'
import type { ItemDetalle } from '@/services/itemService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { getRazaInfo, getClaseInfo, getTrasfondoInfo } from '@/utils/characterDetails'
import type { RasgoConDesc } from '@/utils/characterDetails'

interface BaseProps {
  draft: CharacterDraft
  onChange: (partial: Partial<CharacterDraft>) => void
}

interface Props extends BaseProps {
  razaDetalle: ItemDetalle | null
  claseDetalle: ItemDetalle | null
  trasfondoDetalle: ItemDetalle | null
}

// ── Armas ──────────────────────────────────────────────────────────────────

function WeaponsTab({ draft, onChange }: BaseProps) {
  const add = () => {
    const entry: WeaponEntry = { id: crypto.randomUUID(), nombre: '', bonus_ataque: 0, dano: '1d6', tipo_dano: 'cortante' }
    onChange({ armas: [...draft.armas, entry] })
  }
  const update = (id: string, partial: Partial<WeaponEntry>) =>
    onChange({ armas: draft.armas.map((w) => w.id === id ? { ...w, ...partial } : w) })
  const remove = (id: string) =>
    onChange({ armas: draft.armas.filter((w) => w.id !== id) })

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
        <span>Nombre</span><span>Bon.</span><span>Daño</span><span />
      </div>
      {draft.armas.map((w) => (
        <div key={w.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-1 items-center">
          <Input value={w.nombre} onChange={(e) => update(w.id, { nombre: e.target.value })}
            placeholder="Espada larga" className="h-7 text-xs bg-secondary border-border/60" />
          <input type="number" value={w.bonus_ataque}
            onChange={(e) => update(w.id, { bonus_ataque: Number(e.target.value) })}
            className="w-14 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <Input value={w.dano} onChange={(e) => update(w.id, { dano: e.target.value })}
            placeholder="1d8" className="w-16 h-7 text-xs bg-secondary border-border/60 text-center" />
          <button type="button" onClick={() => remove(w.id)} className="text-destructive hover:text-destructive/80 p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-1 border-dashed border-border/60 text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Añadir arma
      </Button>
    </div>
  )
}

// ── Defensa ────────────────────────────────────────────────────────────────

function DefenseTab({ draft }: Pick<BaseProps, 'draft'>) {
  return (
    <div className="text-xs text-muted-foreground flex flex-col gap-1">
      <p>CA actual: <span className="font-bold text-foreground">{draft.combate.ca}</span></p>
      <p>PV máx: <span className="font-bold text-foreground">{draft.combate.pv_max}</span></p>
      <p>PV actual: <span className="font-bold text-foreground">{draft.combate.pv_actual}</span></p>
    </div>
  )
}

// ── Equipo ─────────────────────────────────────────────────────────────────

function EquipmentTab({ draft, onChange }: BaseProps) {
  const add = () => {
    const entry: EquipmentEntry = { id: crypto.randomUUID(), nombre: '', cantidad: 1 }
    onChange({ equipo: [...draft.equipo, entry] })
  }
  const update = (id: string, partial: Partial<EquipmentEntry>) =>
    onChange({ equipo: draft.equipo.map((e) => e.id === id ? { ...e, ...partial } : e) })
  const remove = (id: string) =>
    onChange({ equipo: draft.equipo.filter((e) => e.id !== id) })

  return (
    <div className="flex flex-col gap-2">
      {draft.equipo.map((e) => (
        <div key={e.id} className="flex gap-1 items-center">
          <Input value={e.nombre} onChange={(ev) => update(e.id, { nombre: ev.target.value })}
            placeholder="Mochila..." className="h-7 text-xs bg-secondary border-border/60 flex-1" />
          <input type="number" value={e.cantidad} min={1}
            onChange={(ev) => update(e.id, { cantidad: Number(ev.target.value) })}
            className="w-14 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <button type="button" onClick={() => remove(e.id)} className="text-destructive hover:text-destructive/80 p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-1 border-dashed border-border/60 text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Añadir objeto
      </Button>
    </div>
  )
}

// ── Conjuros ───────────────────────────────────────────────────────────────

function SpellsTab({ draft, onChange }: BaseProps) {
  const add = () => {
    const entry: SpellEntry = { id: crypto.randomUUID(), nombre: '', nivel: 0, escuela: '', descripcion: '' }
    onChange({ conjuros: [...draft.conjuros, entry] })
  }
  const update = (id: string, partial: Partial<SpellEntry>) =>
    onChange({ conjuros: draft.conjuros.map((s) => s.id === id ? { ...s, ...partial } : s) })
  const remove = (id: string) =>
    onChange({ conjuros: draft.conjuros.filter((s) => s.id !== id) })

  return (
    <div className="flex flex-col gap-2">
      {draft.conjuros.map((s) => (
        <div key={s.id} className="flex flex-col gap-1 p-2 rounded-md bg-secondary/60 border border-border/40">
          <div className="flex gap-1 items-center">
            <Input value={s.nombre} onChange={(e) => update(s.id, { nombre: e.target.value })}
              placeholder="Bola de fuego" className="h-7 text-xs bg-background border-border/60 flex-1" />
            <input type="number" value={s.nivel} min={0} max={9}
              onChange={(e) => update(s.id, { nivel: Number(e.target.value) })}
              className="w-12 h-7 bg-background border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <button type="button" onClick={() => remove(s.id)} className="text-destructive hover:text-destructive/80 p-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input value={s.escuela} onChange={(e) => update(s.id, { escuela: e.target.value })}
            placeholder="Evocación" className="h-6 text-[11px] bg-background border-border/40" />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-1 border-dashed border-border/60 text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Añadir conjuro
      </Button>
    </div>
  )
}

// ── Rasgos / Dotes ─────────────────────────────────────────────────────────

function FeatSection({ title, items }: { title: string; items: RasgoConDesc[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1">{title}</span>
      {items.map((item) => (
        <div key={item.nombre}>
          <button
            type="button"
            onClick={() => item.descripcion && setExpanded(expanded === item.nombre ? null : item.nombre)}
            className={`flex items-center gap-1.5 py-0.5 pl-1 w-full text-left transition-colors ${item.descripcion ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
            <span className="text-xs text-foreground">{item.nombre}</span>
            {item.descripcion && (
              <ChevronDown className={`h-3 w-3 ml-auto text-muted-foreground/60 shrink-0 transition-transform ${expanded === item.nombre ? 'rotate-180' : ''}`} />
            )}
          </button>
          {expanded === item.nombre && item.descripcion && (
            <p className="text-[11px] text-muted-foreground leading-snug pl-4 pr-1 pb-1">
              {item.descripcion}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function FeatsTab({ draft, onChange, razaDetalle, claseDetalle, trasfondoDetalle }: Props) {
  const razaInfo = getRazaInfo(razaDetalle)
  const claseInfo = getClaseInfo(claseDetalle)
  const trasfondoInfo = getTrasfondoInfo(trasfondoDetalle)

  const trasfondoFeats: RasgoConDesc[] = trasfondoInfo?.dote ? [trasfondoInfo.dote] : []
  const claseFeats = claseInfo?.rasgosN1 ?? []
  const razaFeats = razaInfo?.rasgos ?? []
  const hasAutoFeats = claseFeats.length > 0 || trasfondoFeats.length > 0 || razaFeats.length > 0

  const update = (id: string, partial: Partial<FeatEntry>) =>
    onChange({ rasgos: draft.rasgos.map((f) => f.id === id ? { ...f, ...partial } : f) })
  const remove = (id: string) =>
    onChange({ rasgos: draft.rasgos.filter((f) => f.id !== id) })

  return (
    <div className="flex flex-col gap-4">
      {hasAutoFeats && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex flex-col gap-3">
            <FeatSection title="Rasgos de Clase" items={claseFeats} />
            <FeatSection title="Rasgos de Trasfondo" items={trasfondoFeats} />
          </div>
          <div className="flex flex-col gap-3">
            <FeatSection title="Rasgos de Raza" items={razaFeats} />
          </div>
        </div>
      )}

      {hasAutoFeats && <hr className="border-border/40" />}

      <div className="flex flex-col gap-2">
        {draft.rasgos.length > 0 && (
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Rasgos propios</span>
        )}
        {draft.rasgos.map((f) => (
          <div key={f.id} className="flex flex-col gap-1 p-2 rounded-md bg-secondary/60 border border-border/40">
            <div className="flex gap-1 items-center">
              <Input value={f.nombre} onChange={(e) => update(f.id, { nombre: e.target.value })}
                placeholder="Atacante feroz" className="h-7 text-xs bg-background border-border/60 flex-1" />
              <button type="button" onClick={() => remove(f.id)} className="text-destructive hover:text-destructive/80 p-1">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input value={f.descripcion} onChange={(e) => update(f.id, { descripcion: e.target.value })}
              placeholder="Descripción..." className="h-6 text-[11px] bg-background border-border/40" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Detalles ───────────────────────────────────────────────────────────────

function DetailsTab({ draft, onChange }: BaseProps) {
  const det = draft.detalles
  const update = (key: keyof typeof det, value: string) =>
    onChange({ detalles: { ...det, [key]: value } })

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {([
          ['historia', 'Historia'],
          ['rasgos_de_personalidad', 'Rasgos de Personalidad'],
          ['ideales', 'Ideales'],
          ['vinculos', 'Vínculos'],
          ['defectos', 'Defectos'],
          ['apariencia', 'Apariencia'],
        ] as const).map(([key, label]) => (
          <div key={key} className={`flex flex-col gap-1 ${key === 'historia' ? 'col-span-2' : ''}`}>
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Textarea
              value={det[key]}
              onChange={(e) => update(key, e.target.value)}
              rows={key === 'historia' ? 3 : 2}
              className="text-xs bg-secondary border-border/60 resize-none"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([
          ['edad', 'Edad'], ['altura', 'Altura'], ['peso', 'Peso'],
          ['ojos', 'Ojos'], ['piel', 'Piel'], ['pelo', 'Pelo'],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Input value={det[key]} onChange={(e) => update(key, e.target.value)}
              className="h-7 text-xs bg-secondary border-border/60" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RightPanel principal ───────────────────────────────────────────────────

export default function RightPanel({ draft, onChange, razaDetalle, claseDetalle, trasfondoDetalle }: Props) {
  const [tab, setTab] = useState('armas')

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
      <TabsList className="w-full grid grid-cols-6 h-8 shrink-0">
        <TabsTrigger value="armas"    className="text-[11px]">Armas</TabsTrigger>
        <TabsTrigger value="defensa"  className="text-[11px]">Defensa</TabsTrigger>
        <TabsTrigger value="equipo"   className="text-[11px]">Equipo</TabsTrigger>
        <TabsTrigger value="conjuros" className="text-[11px]">Conjuros</TabsTrigger>
        <TabsTrigger value="rasgos"   className="text-[11px]">Rasgos</TabsTrigger>
        <TabsTrigger value="detalles" className="text-[11px]">Detalles</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto mt-3">
        <TabsContent value="armas"    className="mt-0"><WeaponsTab   draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="defensa"  className="mt-0"><DefenseTab   draft={draft} /></TabsContent>
        <TabsContent value="equipo"   className="mt-0"><EquipmentTab draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="conjuros" className="mt-0"><SpellsTab    draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="rasgos"   className="mt-0">
          <FeatsTab draft={draft} onChange={onChange} razaDetalle={razaDetalle} claseDetalle={claseDetalle} trasfondoDetalle={trasfondoDetalle} />
        </TabsContent>
        <TabsContent value="detalles" className="mt-0"><DetailsTab   draft={draft} onChange={onChange} /></TabsContent>
      </div>
    </Tabs>
  )
}
