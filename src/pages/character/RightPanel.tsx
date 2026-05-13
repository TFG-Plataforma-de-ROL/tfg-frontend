import { useState } from 'react'
import type { CharacterDraft, StatBlock, WeaponEntry, EquipmentEntry, SpellEntry, FeatEntry } from '@/types/character'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import {
  getMod, getProfBonus, getSkillMod, getPassivePerception, getInitiative,
  getSpellDC, getSpellAttackBonus, getCasterStat, formatMod, SKILLS, STAT_NAMES,
  type StatKey,
} from '@/utils/dnd'
import type { Item } from '@/services/itemService'

interface Props {
  draft: CharacterDraft
  claseItem: Item | null
  onChange: (partial: Partial<CharacterDraft>) => void
}

// ── helpers ────────────────────────────────────────────────────────────────

function NumInput({
  value, onChange, min, max, className = '',
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; className?: string }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full bg-secondary border border-border/60 rounded-md text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-ring p-1 ${className}`}
    />
  )
}

function StatBox({ stat, value, onChange }: { stat: StatKey; value: number; onChange: (v: number) => void }) {
  const mod = getMod(value)
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        {STAT_NAMES[stat]}
      </span>
      <div className="relative w-14">
        <NumInput value={value} onChange={onChange} min={1} max={30} className="text-lg h-12" />
      </div>
      <span className="text-xs font-bold text-primary">{formatMod(mod)}</span>
    </div>
  )
}

function ProfCircle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
        active ? 'bg-primary border-primary' : 'border-muted-foreground bg-transparent'
      }`}
    />
  )
}

// ── Sección 1: Stats base ──────────────────────────────────────────────────

function Section1({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const stats = draft.stats
  const updateStat = (k: StatKey, v: number) => onChange({ stats: { ...stats, [k]: v } })

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-6 gap-2">
        {(Object.keys(stats) as StatKey[]).map((k) => (
          <StatBox key={k} stat={k} value={stats[k]} onChange={(v) => updateStat(k, v)} />
        ))}
      </div>

      {/* Nivel / Tamaño / Velocidad */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Tamaño</Label>
          <select
            value="Mediano"
            className="bg-secondary border border-border/60 rounded-md text-sm px-2 py-1.5 text-foreground"
          >
            <option>Pequeño</option>
            <option>Mediano</option>
            <option>Grande</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Velocidad</Label>
          <NumInput
            value={draft.combate.velocidad}
            onChange={(v) => onChange({ combate: { ...draft.combate, velocidad: v } })}
            min={0}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">PV Máx</Label>
          <NumInput
            value={draft.combate.pv_max}
            onChange={(v) => onChange({ combate: { ...draft.combate, pv_max: v } })}
            min={1}
          />
        </div>
      </div>
    </div>
  )
}

// ── Sección 2: CA + Salvaciones ────────────────────────────────────────────

function Section2({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const nivel = draft.nivel
  const prof = getProfBonus(nivel)
  const stats = draft.stats
  const salvs = draft.salvaciones
  const statKeys: StatKey[] = ['fue', 'des', 'con', 'int', 'sab', 'car']
  const toggleSalv = (k: StatKey) => onChange({ salvaciones: { ...salvs, [k]: !salvs[k] } })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">CA</Label>
          <NumInput
            value={draft.combate.ca}
            onChange={(v) => onChange({ combate: { ...draft.combate, ca: v } })}
            min={0}
            className="w-14 h-10 text-base"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Salvaciones · Prof +{prof}
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {statKeys.map((k) => {
              const mod = getMod(stats[k]) + (salvs[k] ? prof : 0)
              return (
                <div key={k} className="flex items-center gap-1.5 text-xs">
                  <ProfCircle active={salvs[k]} onClick={() => toggleSalv(k)} />
                  <span className="w-6 text-right font-bold text-primary">{formatMod(mod)}</span>
                  <span className="text-muted-foreground">{STAT_NAMES[k]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sección 3: Inspiración ─────────────────────────────────────────────────

function Section3({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">Inspiración</span>
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ inspiracion: draft.inspiracion === n ? n - 1 : n })}
            className={`w-6 h-6 rounded-full border-2 transition-colors ${
              n <= draft.inspiracion ? 'bg-yellow-400 border-yellow-400' : 'border-muted-foreground'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Sección 4: DC conjuros / bonus ataque ──────────────────────────────────

function Section4({ draft, claseItem }: { draft: CharacterDraft; claseItem: Item | null }) {
  const casterStat = getCasterStat(claseItem?.nombre)
  if (!casterStat) return null
  const statVal = draft.stats[casterStat]
  const nivel = draft.nivel
  const dc = getSpellDC(statVal, nivel)
  const atk = getSpellAttackBonus(statVal, nivel)

  return (
    <div className="flex gap-6 text-xs">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted-foreground uppercase tracking-wide">DC Conjuros</span>
        <span className="text-lg font-bold text-primary">{dc}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted-foreground uppercase tracking-wide">Ataque Conjuro</span>
        <span className="text-lg font-bold text-primary">{formatMod(atk)}</span>
      </div>
    </div>
  )
}

// ── Sección 5: Percepción pasiva + Iniciativa ──────────────────────────────

function Section5({ draft }: { draft: CharacterDraft }) {
  const percep = getPassivePerception(draft.stats.sab, draft.habilidades.percepcion, draft.nivel)
  const init = getInitiative(draft.stats.des)

  return (
    <div className="flex gap-6 text-xs">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted-foreground uppercase tracking-wide">Perc. Pasiva</span>
        <span className="text-lg font-bold">{percep}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted-foreground uppercase tracking-wide">Iniciativa</span>
        <span className="text-lg font-bold">{formatMod(init)}</span>
      </div>
    </div>
  )
}

// ── Sección 6: Habilidades ─────────────────────────────────────────────────

function Section6({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const nivel = draft.nivel
  const habs = draft.habilidades
  const stats = draft.stats
  const toggleHab = (key: keyof typeof habs) =>
    onChange({ habilidades: { ...habs, [key]: !habs[key] } })

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Habilidades</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {SKILLS.map((skill) => {
          const mod = getSkillMod(stats[skill.stat], habs[skill.key], nivel)
          return (
            <div key={skill.key} className="flex items-center gap-1.5 text-xs py-0.5">
              <ProfCircle active={habs[skill.key]} onClick={() => toggleHab(skill.key)} />
              <span className="w-6 text-right font-bold text-primary">{formatMod(mod)}</span>
              <span className="text-muted-foreground truncate">{skill.nombre}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sección 7: Tabs ────────────────────────────────────────────────────────

function WeaponsTab({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const addWeapon = () => {
    const entry: WeaponEntry = { id: crypto.randomUUID(), nombre: '', bonus_ataque: 0, dano: '1d6', tipo_dano: 'cortante' }
    onChange({ armas: [...draft.armas, entry] })
  }
  const updateWeapon = (id: string, partial: Partial<WeaponEntry>) =>
    onChange({ armas: draft.armas.map((w) => w.id === id ? { ...w, ...partial } : w) })
  const removeWeapon = (id: string) =>
    onChange({ armas: draft.armas.filter((w) => w.id !== id) })

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
        <span>Nombre</span><span>Bon. Ataque</span><span>Daño</span><span></span>
      </div>
      {draft.armas.map((w) => (
        <div key={w.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-1 items-center">
          <Input value={w.nombre} onChange={(e) => updateWeapon(w.id, { nombre: e.target.value })}
            placeholder="Espada larga" className="h-7 text-xs bg-secondary border-border/60" />
          <input type="number" value={w.bonus_ataque}
            onChange={(e) => updateWeapon(w.id, { bonus_ataque: Number(e.target.value) })}
            className="w-14 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
          <Input value={w.dano} onChange={(e) => updateWeapon(w.id, { dano: e.target.value })}
            placeholder="1d8" className="w-16 h-7 text-xs bg-secondary border-border/60 text-center" />
          <button type="button" onClick={() => removeWeapon(w.id)} className="text-destructive hover:text-destructive/80 p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addWeapon} className="mt-1 border-dashed border-border/60 text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Añadir arma
      </Button>
    </div>
  )
}

function EquipmentTab({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
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
            className="w-14 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
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

function SpellsTab({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
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
              className="w-12 h-7 bg-background border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
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

function FeatsTab({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const add = () => {
    const entry: FeatEntry = { id: crypto.randomUUID(), nombre: '', descripcion: '' }
    onChange({ rasgos: [...draft.rasgos, entry] })
  }
  const update = (id: string, partial: Partial<FeatEntry>) =>
    onChange({ rasgos: draft.rasgos.map((f) => f.id === id ? { ...f, ...partial } : f) })
  const remove = (id: string) =>
    onChange({ rasgos: draft.rasgos.filter((f) => f.id !== id) })

  return (
    <div className="flex flex-col gap-2">
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
      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-1 border-dashed border-border/60 text-xs h-7">
        <Plus className="h-3 w-3 mr-1" /> Añadir rasgo
      </Button>
    </div>
  )
}

function DetailsTab({ draft, onChange }: { draft: CharacterDraft; onChange: Props['onChange'] }) {
  const det = draft.detalles
  const update = (key: keyof typeof det, value: string) =>
    onChange({ detalles: { ...det, [key]: value } })

  return (
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
      <div className="col-span-2 grid grid-cols-3 gap-2">
        {([
          ['edad', 'Edad'],
          ['altura', 'Altura'],
          ['peso', 'Peso'],
          ['ojos', 'Ojos'],
          ['piel', 'Piel'],
          ['pelo', 'Pelo'],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            <Input
              value={det[key]}
              onChange={(e) => update(key, e.target.value)}
              className="h-7 text-xs bg-secondary border-border/60"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Defense Tab ────────────────────────────────────────────────────────────

function DefenseTab({ draft }: { draft: CharacterDraft }) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>CA actual: <span className="font-bold text-foreground">{draft.combate.ca}</span></p>
      <p className="mt-1">PV máx: <span className="font-bold text-foreground">{draft.combate.pv_max}</span></p>
    </div>
  )
}

// ── Main RightPanel ────────────────────────────────────────────────────────

export default function RightPanel({ draft, claseItem, onChange }: Props) {
  const [tab, setTab] = useState('armas')

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <Section1 draft={draft} onChange={onChange} />
      <div className="border-t border-border/40" />
      <Section2 draft={draft} onChange={onChange} />
      <div className="border-t border-border/40" />
      <Section3 draft={draft} onChange={onChange} />
      <Section4 draft={draft} claseItem={claseItem} />
      <Section5 draft={draft} />
      <div className="border-t border-border/40" />
      <Section6 draft={draft} onChange={onChange} />
      <div className="border-t border-border/40" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-5 h-8">
          <TabsTrigger value="armas" className="text-[11px]">Armas</TabsTrigger>
          <TabsTrigger value="defensa" className="text-[11px]">Defensa</TabsTrigger>
          <TabsTrigger value="equipo" className="text-[11px]">Equipo</TabsTrigger>
          <TabsTrigger value="conjuros" className="text-[11px]">Conjuros</TabsTrigger>
          <TabsTrigger value="rasgos" className="text-[11px]">Rasgos</TabsTrigger>
        </TabsList>
        <TabsContent value="armas" className="mt-2"><WeaponsTab draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="defensa" className="mt-2"><DefenseTab draft={draft} /></TabsContent>
        <TabsContent value="equipo" className="mt-2"><EquipmentTab draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="conjuros" className="mt-2"><SpellsTab draft={draft} onChange={onChange} /></TabsContent>
        <TabsContent value="rasgos" className="mt-2"><FeatsTab draft={draft} onChange={onChange} /></TabsContent>
      </Tabs>

      {/* Detalles siempre visible debajo de los tabs */}
      <div className="border-t border-border/40 pt-3">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Detalles</p>
        <DetailsTab draft={draft} onChange={onChange} />
      </div>
    </div>
  )
}
