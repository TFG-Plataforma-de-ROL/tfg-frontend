import { useState } from 'react'
import type { CharacterDraft, WeaponEntry, EquipmentEntry, SpellEntry, FeatEntry } from '@/types/character'
import type { ItemDetalle } from '@/services/itemService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ChevronDown, Sword, Shield, Volume2 } from 'lucide-react'
import { getRazaInfo, getClaseInfo, getTrasfondoInfo } from '@/utils/characterDetails'
import type { RasgoConDesc } from '@/utils/characterDetails'
import WeaponPickerDialog from './WeaponPickerDialog'
import ArmorPickerDialog from './ArmorPickerDialog'
import { tieneCompetencia, type ArmaBase, type CategoriaArma } from '@/data/armasData'
import {
  ARMADURAS, calcularCA, formulaCA, labelCategoriaArmadura,
  tieneCompetenciaArmadura, tieneCompetenciaEscudo,
} from '@/data/armadurasData'

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

function WeaponsTab({ draft, onChange, claseDetalle }: BaseProps & { claseDetalle: ItemDetalle | null }) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const claseData = (claseDetalle?.datos as Record<string, unknown> | undefined)
  const claseProficiencias: string[] = (claseData?.clase as Record<string, unknown> | undefined)
    ?.competencias
    ? ((claseData?.clase as Record<string, unknown>).competencias as Record<string, unknown>).armas as string[]
    : []

  const update = (id: string, partial: Partial<WeaponEntry>) =>
    onChange({ armas: draft.armas.map((w) => w.id === id ? { ...w, ...partial } : w) })
  const remove = (id: string) =>
    onChange({ armas: draft.armas.filter((w) => w.id !== id) })

  const handleAddFromPicker = (arma: ArmaBase) => {
    const entry: WeaponEntry = {
      id: crypto.randomUUID(),
      nombre: arma.nombre,
      bonus_ataque: 0,
      dano: arma.dano,
      tipo_dano: arma.tipo_dano,
      categoria: arma.categoria,
    }
    onChange({ armas: [...draft.armas, entry] })
  }

  return (
    <div className="flex flex-col gap-2">
      {draft.armas.length > 0 && (
        <>
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
            <span className="w-5" />
            <span>Nombre</span>
            <span className="w-12 text-center">Bon.</span>
            <span className="w-16 text-center">Daño</span>
            <span className="w-6" />
          </div>

          {draft.armas.map((w) => {
            const comp = w.categoria
              ? tieneCompetencia(w.categoria as CategoriaArma, claseProficiencias)
              : false
            return (
              <div key={w.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-1 items-center">
                <div className="w-5 flex items-center justify-center">
                  {comp
                    ? <span className="w-4 h-4 rounded-full bg-green-600/20 flex items-center justify-center" title="Competente">
                        <span className="text-green-400 text-[9px] font-bold">C</span>
                      </span>
                    : <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                        <Sword className="h-2.5 w-2.5 text-muted-foreground/50" />
                      </span>
                  }
                </div>
                <Input value={w.nombre} onChange={(e) => update(w.id, { nombre: e.target.value })}
                  placeholder="Espada larga" className="h-7 text-xs bg-secondary border-border/60" />
                <input type="number" value={w.bonus_ataque}
                  onChange={(e) => update(w.id, { bonus_ataque: Number(e.target.value) })}
                  className="w-12 h-7 bg-secondary border border-border/60 rounded-md text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <Input value={w.dano} onChange={(e) => update(w.id, { dano: e.target.value })}
                  placeholder="1d8" className="w-16 h-7 text-xs bg-secondary border-border/60 text-center" />
                <button type="button" onClick={() => remove(w.id)} className="w-6 text-destructive hover:text-destructive/80 flex items-center justify-center">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </>
      )}

      {draft.armas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
          <Sword className="h-8 w-8 opacity-20" />
          <p className="text-xs">Aún no has añadido ningún arma</p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPickerOpen(true)}
        className="mt-1 border-dashed border-border/60 text-xs h-7"
      >
        <Plus className="h-3 w-3 mr-1" /> Añadir arma
      </Button>

      <WeaponPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddFromPicker}
        claseProficiencias={claseProficiencias}
      />
    </div>
  )
}

// ── Defensa ────────────────────────────────────────────────────────────────

function DefenseTab({ draft, onChange, claseDetalle }: BaseProps & { claseDetalle: ItemDetalle | null }) {
  const [armorPickerOpen, setArmorPickerOpen] = useState(false)

  const claseData = (claseDetalle?.datos as Record<string, unknown> | undefined)
  const claseComp = (claseData?.clase as Record<string, unknown> | undefined)?.competencias as Record<string, unknown> | undefined
  const claseProfArmaduras: string[] = (claseComp?.armaduras as string[] | undefined) ?? []

  const armaduraEquipada = ARMADURAS.find(a => a.id === draft.armadura_equipada) ?? null
  const escudo = draft.escudo_equipado

  const caCalculada = calcularCA(armaduraEquipada, escudo, draft.stats.des)

  const handleEquipArmadura = (id: string | null) => {
    const armadura = id ? ARMADURAS.find(a => a.id === id) ?? null : null
    const nuevaCA = calcularCA(armadura, escudo, draft.stats.des)
    onChange({ armadura_equipada: id, combate: { ...draft.combate, ca: nuevaCA } })
  }

  const handleToggleEscudo = () => {
    const nuevoEscudo = !escudo
    const nuevaCA = calcularCA(armaduraEquipada, nuevoEscudo, draft.stats.des)
    onChange({ escudo_equipado: nuevoEscudo, combate: { ...draft.combate, ca: nuevaCA } })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Competencias de armaduras */}
      {claseProfArmaduras.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-secondary/40 border border-border/30">
          <span className="text-xs">Competencias de armaduras:</span>
          <div className="flex flex-wrap gap-1">
            {claseProfArmaduras.map((categoria) => (
              <span key={categoria} className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded">
                {categoria}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Escudo */}
      <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/40 border border-border/30">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs">Escudo (+2 CA)</span>
          {tieneCompetenciaEscudo(claseProfArmaduras) && (
            <span className="w-3.5 h-3.5 rounded-full bg-green-600/20 flex items-center justify-center" title="Competente con escudos">
              <span className="text-green-400 text-[8px] font-bold">C</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleEscudo}
          className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
            escudo ? 'bg-primary' : 'bg-secondary border border-border/60'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
            escudo ? 'left-5' : 'left-1'
          }`} />
        </button>
      </div>

      {/* Armadura equipada */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Armadura</p>
        {armaduraEquipada ? (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-secondary/60 border border-border/40">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold shrink-0 ${
              armaduraEquipada.categoria === 'ligera'  ? 'bg-sky-600/80 text-white' :
              armaduraEquipada.categoria === 'mediana' ? 'bg-amber-600/80 text-white' :
              'bg-slate-600/80 text-white'
            }`}>
              {armaduraEquipada.categoria === 'ligera' ? 'L' : armaduraEquipada.categoria === 'mediana' ? 'M' : 'P'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{armaduraEquipada.nombre}</p>
              <p className="text-[10px] text-muted-foreground">{formulaCA(armaduraEquipada)}</p>
            </div>
            {armaduraEquipada.desventaja_sigilo && (
              <span title="Desventaja en sigilo"><Volume2 className="h-3.5 w-3.5 text-orange-400/80 shrink-0" /></span>
            )}
            {tieneCompetenciaArmadura(armaduraEquipada.categoria, claseProfArmaduras) && (
              <span className="w-4 h-4 rounded-full bg-green-600/20 flex items-center justify-center shrink-0" title="Competente">
                <span className="text-green-400 text-[9px] font-bold">C</span>
              </span>
            )}
            <Button
              type="button" variant="ghost" size="sm"
              onClick={() => setArmorPickerOpen(true)}
              className="h-6 px-2 text-[11px] shrink-0"
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setArmorPickerOpen(true)}
            className="w-full flex items-center gap-2 p-2.5 rounded-md border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Shield className="h-4 w-4 opacity-40" />
            <span className="text-xs">Sin armadura — pulsa para equipar</span>
          </button>
        )}
      </div>

      <ArmorPickerDialog
        open={armorPickerOpen}
        onClose={() => setArmorPickerOpen(false)}
        onEquip={handleEquipArmadura}
        equipadaId={draft.armadura_equipada}
        claseProficiencias={claseProfArmaduras}
      />
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
        <TabsContent value="armas"    className="mt-0"><WeaponsTab   draft={draft} onChange={onChange} claseDetalle={claseDetalle} /></TabsContent>
        <TabsContent value="defensa"  className="mt-0"><DefenseTab   draft={draft} onChange={onChange} claseDetalle={claseDetalle} /></TabsContent>
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
